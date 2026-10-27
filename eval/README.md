# Evaluation

An automatic test of answer quality. It uploads four fictional documents (two English contracts with
different numbers, a German employee handbook and an English resume), asks about 49 questions through the real
chat API and scores each answer.

```bash
npm run dev                                   # in one terminal, or point EVAL_BASE_URL at a deployment
node --env-file=.env.local eval/run.mjs       # in another
```

It needs `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`
in `.env.local`. The service role key is used only to create and delete a temporary test user; the app
itself never uses it. Optional settings: `EVAL_BASE_URL` (default `http://localhost:3000`),
`EVAL_PACE_MS` (pause between questions, default 5000, to stay inside the free AI quota).

The run writes [RESULTS.md](RESULTS.md) and `results.json`.

| File | What it holds |
| --- | --- |
| `documents.mjs` | The fictional documents, with every fact the questions ask about |
| `questions.mjs` | The questions, with expected facts and the page each should cite |
| `pdf.mjs` | A small PDF writer for the fixtures |
| `run.mjs` | The runner and scorer |

To add a question, add a line to `questions.mjs`. To add a document, add it to `documents.mjs` and
reference it by its key.
