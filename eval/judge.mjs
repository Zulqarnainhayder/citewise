// Scores one answer against its question. Pure functions, so they can be tested.

export const norm = (text) => text.toLowerCase().replace(/\s+/g, " ");

/** An answer that says the information is not in the documents (English or German). */
export const REFUSAL = /couldn['’]t find|could not find|konnte .{0,60}nicht finden|nicht .{0,40}(gefunden|finden)|keine information/i;

/** The source numbers an answer cites, such as [1], [1, 2] or [2-4]. */
export function citedNumbers(text) {
  const cited = new Set();
  for (const m of text.matchAll(/\[([\d,\s–-]+)\]/g)) {
    for (const part of m[1].split(",")) {
      const [a, b] = part.split(/[–-]/).map((n) => Number(n.trim()));
      if (!Number.isNaN(b) && b >= a && b - a <= 10) for (let n = a; n <= b; n++) cited.add(n);
      else if (!Number.isNaN(a)) cited.add(a);
    }
  }
  return cited;
}

/**
 * @param q       the question definition from questions.mjs
 * @param result  { answer, sources: [{ n, documentId, page }], error }
 * @param docKeyById  maps a document id to its key in documents.mjs
 */
export function judge(q, result, docKeyById) {
  const answer = result.answer ?? "";
  const refused = REFUSAL.test(answer);
  if (result.error && !answer) return { pass: false, note: `error: ${result.error}` };

  if (q.type === "unanswerable") return { pass: refused, refused, note: refused ? "" : `answered: ${answer.slice(0, 90)}` };
  if (q.type === "smalltalk") return { pass: !refused && answer.length > 0, refused, note: refused ? "refused small talk" : "" };

  const text = norm(answer);
  const answerOk = q.answer.every((group) => group.some((word) => text.includes(word)));
  const retrievedKeys = new Set(result.sources.map((s) => `${docKeyById[s.documentId]}:${s.page}`));
  const retrievalOk = q.cites.every((c) => retrievedKeys.has(`${c.doc}:${c.page}`));
  const citedKeys = new Set(
    [...citedNumbers(answer)].map((n) => result.sources.find((s) => s.n === n)).filter(Boolean).map((s) => `${docKeyById[s.documentId]}:${s.page}`),
  );
  const citationOk = q.cites.every((c) => citedKeys.has(`${c.doc}:${c.page}`));
  const notes = [];
  if (!answerOk) notes.push(`answer: ${answer.replace(/\s+/g, " ").slice(0, 110)}`);
  if (!retrievalOk) notes.push("right page not retrieved");
  if (!citationOk) notes.push("right page not cited");
  return { pass: answerOk && citationOk, answerOk, retrievalOk, citationOk, refused, note: notes.join("; ") };
}
