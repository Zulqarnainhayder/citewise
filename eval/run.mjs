// Evaluation: asks every question in questions.mjs through the real chat API and scores the answers.
//
//   node --env-file=.env.local eval/run.mjs
//
// Needs the app running (EVAL_BASE_URL, default http://localhost:3000) and these variables:
// NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY (only to
// create and delete a temporary test user; the app itself never uses the service role key).

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { DOCUMENTS } from "./documents.mjs";
import { judge } from "./judge.mjs";
import { makePdf } from "./pdf.mjs";
import { QUESTIONS } from "./questions.mjs";

const BASE = process.env.EVAL_BASE_URL ?? "http://localhost:3000";
const PACE_MS = Number(process.env.EVAL_PACE_MS ?? 5000);
const MODEL = process.env.GEMINI_CHAT_MODEL ?? "gemini-3.5-flash-lite";
const here = (file) => fileURLToPath(new URL(file, import.meta.url));

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !ANON || !SERVICE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function ask({ cookie, chatId, documentIds, question }) {
  const started = Date.now();
  const response = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ question, chatId, documentIds }),
  });
  if (!response.headers.get("content-type")?.startsWith("application/x-ndjson")) {
    return { error: (await response.json().catch(() => ({}))).error ?? `HTTP ${response.status}`, status: response.status };
  }
  let sources = [], answer = "", firstToken = null, error = null, buffer = "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let newline;
    while ((newline = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (!line) continue;
      const event = JSON.parse(line);
      if (event.type === "sources") sources = event.sources;
      if (event.type === "delta") { firstToken ??= Date.now() - started; answer += event.text; }
      if (event.type === "error") error = event.message;
    }
  }
  return { answer, sources, error, firstToken, total: Date.now() - started, status: 200 };
}

async function askWithRetry(args) {
  for (let attempt = 1; ; attempt++) {
    const result = await ask(args);
    const busy = result.status === 429 || /busy|too quickly/i.test(result.error ?? "");
    if (!busy || attempt >= 4) return result;
    process.stdout.write(" (AI quota, waiting 30s)");
    await sleep(30_000);
  }
}

const percentile = (values, p) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))] : null;
};
const pct = (n, d) => (d ? `${((100 * n) / d).toFixed(0)}%` : "n/a");

const admin = createClient(URL_, SERVICE, { auth: { persistSession: false } });
const email = `citewise-eval-${Date.now()}@example.com`;
const password = `Eval-${randomUUID()}`;
let userId;
const storagePaths = [];

try {
  const { data: created, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  userId = created.user.id;

  const jar = new Map();
  const supabase = createServerClient(URL_, ANON, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (list) => list.forEach(({ name, value }) => jar.set(name, value)),
    },
  });
  await supabase.auth.signInWithPassword({ email, password });
  const cookie = [...jar].map(([n, v]) => `${n}=${v}`).join("; ");

  console.log(`Evaluating ${QUESTIONS.length} questions against ${BASE} (model ${MODEL})\n`);
  console.log("Uploading and processing the test documents...");
  const idByKey = {};
  for (const [key, doc] of Object.entries(DOCUMENTS)) {
    const id = randomUUID();
    const path = `${userId}/${id}.pdf`;
    storagePaths.push(path);
    await supabase.storage.from("documents").upload(path, makePdf(doc.pages), { contentType: "application/pdf" });
    await supabase.from("documents").insert({ id, user_id: userId, title: doc.title, storage_path: path });
    let status;
    for (let attempt = 0; attempt < 4; attempt++) {
      const r = await fetch(`${BASE}/api/documents/${id}/process`, { method: "POST", headers: { cookie } });
      status = r.status;
      if (status !== 429) break;
      await sleep(30_000);
    }
    if (status !== 200) throw new Error(`Processing ${doc.title} failed with HTTP ${status}`);
    idByKey[key] = id;
    console.log(`  ${doc.title}: ready`);
  }
  const docKeyById = Object.fromEntries(Object.entries(idByKey).map(([k, id]) => [id, k]));

  // One chat for all questions; its messages are cleared between questions so no answer can influence the next.
  const { data: chat } = await admin.from("chats").insert({ user_id: userId, title: "evaluation" }).select("id").single();

  console.log("\nAsking questions...");
  const rows = [];
  for (const q of QUESTIONS) {
    await admin.from("messages").delete().eq("chat_id", chat.id);
    const documentIds = q.scope === "all" ? undefined : q.scope.map((k) => idByKey[k]);
    process.stdout.write(`  ${q.id.padEnd(15)}`);
    const result = await askWithRetry({ cookie, chatId: chat.id, documentIds, question: q.question });
    const verdict = judge(q, result, docKeyById);
    rows.push({ q, result, verdict });
    console.log(`${verdict.pass ? "PASS" : "FAIL"}  ${result.firstToken ?? "-"} ms  ${verdict.note}`);
    await sleep(PACE_MS);
  }

  // ---- summary ----
  const answerable = rows.filter((r) => r.q.answer);
  const unanswerable = rows.filter((r) => r.q.type === "unanswerable");
  const smalltalk = rows.filter((r) => r.q.type === "smalltalk");
  const count = (list, f) => list.filter(f).length;
  const byType = {};
  for (const r of rows) {
    byType[r.q.type] ??= { total: 0, pass: 0 };
    byType[r.q.type].total++;
    if (r.verdict.pass) byType[r.q.type].pass++;
  }
  const firstTokens = rows.map((r) => r.result.firstToken).filter((v) => v != null);
  const totals = rows.map((r) => r.result.total).filter((v) => v != null);

  const summary = {
    overall: { pass: count(rows, (r) => r.verdict.pass), total: rows.length },
    retrievalHit: { n: count(answerable, (r) => r.verdict.retrievalOk), of: answerable.length },
    answerCorrect: { n: count(answerable, (r) => r.verdict.answerOk), of: answerable.length },
    citationCorrect: { n: count(answerable, (r) => r.verdict.citationOk), of: answerable.length },
    overRefusal: { n: count(answerable, (r) => r.verdict.refused), of: answerable.length },
    correctRefusal: { n: count(unanswerable, (r) => r.verdict.refused), of: unanswerable.length },
    smalltalkOk: { n: count(smalltalk, (r) => r.verdict.pass), of: smalltalk.length },
    firstTokenMs: { p50: percentile(firstTokens, 50), p95: percentile(firstTokens, 95) },
    totalMs: { p50: percentile(totals, 50), p95: percentile(totals, 95) },
    byType,
  };

  console.log("\n=== Results ===");
  console.log(`Overall:                 ${summary.overall.pass}/${summary.overall.total} (${pct(summary.overall.pass, summary.overall.total)})`);
  console.log(`Right page retrieved:    ${summary.retrievalHit.n}/${summary.retrievalHit.of} (${pct(summary.retrievalHit.n, summary.retrievalHit.of)})`);
  console.log(`Answer correct:          ${summary.answerCorrect.n}/${summary.answerCorrect.of} (${pct(summary.answerCorrect.n, summary.answerCorrect.of)})`);
  console.log(`Right page cited:        ${summary.citationCorrect.n}/${summary.citationCorrect.of} (${pct(summary.citationCorrect.n, summary.citationCorrect.of)})`);
  console.log(`Wrongly refused:         ${summary.overRefusal.n}/${summary.overRefusal.of}`);
  console.log(`Correctly refused:       ${summary.correctRefusal.n}/${summary.correctRefusal.of} (${pct(summary.correctRefusal.n, summary.correctRefusal.of)})`);
  console.log(`First token p50 / p95:   ${summary.firstTokenMs.p50} ms / ${summary.firstTokenMs.p95} ms`);

  // ---- files ----
  const date = new Date().toISOString().slice(0, 10);
  writeFileSync(here("results.json"), JSON.stringify({ date, base: BASE, model: MODEL, summary, rows: rows.map((r) => ({ id: r.q.id, type: r.q.type, pass: r.verdict.pass, firstTokenMs: r.result.firstToken, note: r.verdict.note })) }, null, 2) + "\n");

  const typeLabel = { fact: "Facts from one document", paraphrase: "Reworded questions", reasoning: "Small calculation or comparison", crosslanguage: "Across languages", multidoc: "Several documents at once", unanswerable: "Not in the documents (including a trap and a hijack attempt)", smalltalk: "Small talk" };
  const md = [
    "# Evaluation results",
    "",
    `Run on ${date} against \`${BASE}\` with \`${MODEL}\` answering. One run of ${rows.length} questions over 4 fictional documents (English and German).`,
    "",
    "| Measure | Result |",
    "| --- | --- |",
    `| Questions answered correctly and cited from the right page | **${summary.overall.pass}/${summary.overall.total} (${pct(summary.overall.pass, summary.overall.total)})** |`,
    `| Right document page found by search (answerable questions) | ${summary.retrievalHit.n}/${summary.retrievalHit.of} (${pct(summary.retrievalHit.n, summary.retrievalHit.of)}) |`,
    `| Answer contains the correct fact | ${summary.answerCorrect.n}/${summary.answerCorrect.of} (${pct(summary.answerCorrect.n, summary.answerCorrect.of)}) |`,
    `| Answer cites the right page | ${summary.citationCorrect.n}/${summary.citationCorrect.of} (${pct(summary.citationCorrect.n, summary.citationCorrect.of)}) |`,
    `| Answerable questions wrongly refused | ${summary.overRefusal.n}/${summary.overRefusal.of} |`,
    `| Unanswerable questions correctly refused | ${summary.correctRefusal.n}/${summary.correctRefusal.of} (${pct(summary.correctRefusal.n, summary.correctRefusal.of)}) |`,
    `| Time to first word (median / slowest 5%) | ${summary.firstTokenMs.p50} ms / ${summary.firstTokenMs.p95} ms |`,
    "",
    "## By kind of question",
    "",
    "| Kind | Passed |",
    "| --- | --- |",
    ...Object.entries(byType).map(([type, v]) => `| ${typeLabel[type]} | ${v.pass}/${v.total} |`),
    "",
    "## Every question",
    "",
    "| Result | Id | Question | Note |",
    "| --- | --- | --- | --- |",
    ...rows.map((r) => `| ${r.verdict.pass ? "pass" : "**fail**"} | ${r.q.id} | ${r.q.question.replace(/\|/g, "/")} | ${(r.verdict.note || "").replace(/\|/g, "/")} |`),
    "",
    "## How it is scored",
    "",
    "- **Answer correct:** the answer must contain every expected fact (a fact may be written several ways, such as `30` or `thirty`).",
    "- **Right page cited:** the answer's `[n]` citations must point to the expected document and page.",
    "- **Right page found:** the expected page must be among the passages the search returned, whatever the answer says.",
    "- **Refusal:** for questions that are not answered by the documents, the correct reply is some form of \"I couldn't find that in your documents\".",
    "- Matching is automatic string matching, with no human or AI judge, so it can be stricter than a person would be.",
    "",
    "## Limits of this evaluation",
    "",
    "- The documents are short and fictional, so this shows the pipeline works, not how it scales to long real documents.",
    "- It is one run. Model answers vary a little between runs.",
    "- Scanned (image-only) PDFs are not covered because they are not supported.",
    "",
    "Run it yourself: `node --env-file=.env.local eval/run.mjs` (see [eval/README.md](README.md)).",
    "",
  ].join("\n");
  writeFileSync(here("RESULTS.md"), md);
  console.log("\nWrote eval/RESULTS.md and eval/results.json");
} finally {
  if (storagePaths.length) await admin.storage.from("documents").remove(storagePaths);
  if (userId) await admin.auth.admin.deleteUser(userId);
  console.log("Cleaned up the temporary user and files.");
}
