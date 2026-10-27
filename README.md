<div align="center">

# CiteWise

**Chat with your documents. Every answer cites its page.**

Upload PDFs, ask questions in English or German, and jump straight to the passage behind every answer.

![Status](https://img.shields.io/badge/status-in%20development-f59e0b)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06b6d4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ecf8e?logo=supabase&logoColor=white)

</div>

---

## Overview

CiteWise is a document-research app built around **verifiable answers**. Instead of
returning a block of text you have to trust, it will show the exact page of the exact
document each answer came from, so you can check it in one click.

> **Status: early development.** Authentication, the database schema, the dashboard,
> PDF upload, PDF processing, and chat with page citations and saved chat history are done.
> Workspaces and a PDF viewer that opens at the cited page are next. See the [roadmap](#roadmap) for what is built and what is planned.

## What works today

| Area | Status | Details |
| --- | --- | --- |
| Sign up / sign in / sign out | Done | Email and password through Supabase Auth |
| Route protection | Done | Logged-out visitors are redirected to `/login` |
| Database schema | Done | Documents, chunks with page numbers and embeddings, chats, messages, workspaces |
| Row Level Security | Done | Every table is locked to its owner |
| Private file storage | Done | A private `documents` bucket, PDF only, 10 MB limit, per-user folders |
| Vector search function | Done | `match_chunks()` finds the closest passages by meaning |
| PDF upload | Done | Drag and drop or file picker, PDF only, up to 10 MB each, up to 5 at once, straight to private storage |
| PDF processing | Done | Text extracted page by page, split into overlapping chunks, embedded with Gemini (768 dimensions) and saved with page numbers. Status moves Uploaded, Processing, Ready or Failed, with a retry button |
| Chat with page citations | Done | Streamed answers from a Gemini chat model, grounded only in your documents (choose which documents to search; with several, answers name each document and keep their facts separate), with `[n]` citation badges and expandable source passages. Says "I couldn't find that in your documents" instead of guessing. Works across English and German |
| Saved chat history | Done | Every chat is saved with its sources and opens at its own address (`/chat/<id>`), with a short AI-written title. Recent chats are listed in the sidebar by date, with delete; follow-up questions use the saved conversation |
| Semantic search | Verified | `match_chunks()` returns the right page for questions in English and German |
| Document library | Done | List with status badges, summary counts, search by name and delete |
| Dashboard layout | Done | Sidebar navigation, page header, responsive top bar on phones |
| Light, dark and system themes | Done | Remembered per browser, applied before first paint so there is no flash |
| Login UI | Done | Responsive, password-strength hint |

### What you can do right now

1. Open the app and **create an account** on the sign-up tab.
2. **Sign in** and land on your document library.
3. **Upload PDFs** and see them appear in the list with an "Uploaded" status.
4. **Search** your library by name, and **delete** documents you no longer need.
5. Switch between **light, dark and system** themes from the sidebar.
6. **Sign out**.

Each upload is processed automatically: you can watch it go from Uploaded to
Processing to Ready, with a page count. Failed documents (for example scanned,
image-only PDFs) show a clear reason and a retry button. Open **Chat** to ask
questions about all your ready documents, or just one, and see which pages each
answer came from. Chats are saved automatically, so you can leave and come back to them
from the **Recent chats** list.

## Planned features

**Phase 1: core**
- ~~Upload PDFs~~ (done) and ask questions about them
- Streamed answers
- Source passages shown with each answer

**Phase 2: what sets it apart**
- Clickable page citations that open the PDF at the right page
- Saved chat history with a sidebar of past chats
- Workspaces that group documents, such as "Uni notes" or "Contracts"
- English and German, including cross-language questions
- Honest answers: "not found in your documents" instead of guessing
- An automatic summary and suggested questions after each upload

**Phase 3: advanced**
- Hybrid keyword and semantic search with reranking
- An evaluation set with a published accuracy score
- A switchable model provider (Gemini, OpenAI, Claude or a local model)
- More file types: Word, text and web pages
- Tests, CI and a live deployment

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Cache Components) and React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 with a two-color theme (slate-navy and emerald) |
| Auth, database, storage | [Supabase](https://supabase.com) (Postgres, pgvector, Auth, Storage) |
| PDF text | [unpdf](https://github.com/unjs/unpdf), a serverless-friendly pdf.js build |
| AI | Google Gemini: `gemini-embedding-001` for embeddings (768 dimensions) and `gemini-3.5-flash-lite` for answers (set `GEMINI_CHAT_MODEL` to change) |
| Markdown | [react-markdown](https://github.com/remarkjs/react-markdown) renders answers safely |

There is no separate backend. The server logic lives in Next.js route handlers and
server actions, so the whole app deploys as one project (for example on Vercel).

## Database design

```
auth.users
   |
   +-- workspaces   (name)
   +-- documents    (title, storage_path, page_count, language, status, summary,
   |                 suggested_questions, workspace_id)
   |      +-- chunks    (page_number, chunk_index, content, embedding vector(768),
   |                     full-text search column)
   +-- chats        (title, workspace_id)
          +-- messages  (role, content, sources jsonb)
```

- **Page numbers on every chunk** are what make page-level citations possible.
- **Row Level Security** is enabled on every table. Policies only allow a user to read
  and write rows they own, and they also check that linked rows (a workspace, a document,
  a chat) belong to the same user.
- **`match_chunks(query_embedding, match_count, filter_document_ids, filter_workspace_id)`**
  runs with the caller's permissions, so search results respect RLS automatically.
- **Storage** files live under `<user_id>/...` in a private bucket, with matching policies.

The full schema is in [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).

## Getting started

### Prerequisites

- Node.js 20 or newer
- A free [Supabase](https://supabase.com) project
- A free [Google AI Studio](https://aistudio.google.com) API key (used from the upload milestone onward)

### 1. Clone and install

```bash
git clone https://github.com/Zulqarnainhayder/citewise.git
cd citewise
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project.
2. Open **SQL Editor**, paste the contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), and run it.
3. Optional for local development: in **Authentication, then Sign In / Providers, then Email**,
   turn off **Confirm email** so you can sign in right after signing up.

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```bash
GOOGLE_API_KEY=                      # Google AI Studio key (server only)
NEXT_PUBLIC_SUPABASE_URL=            # Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=       # Publishable (anon) key, safe for the browser
SUPABASE_SERVICE_ROLE_KEY=           # Secret key, server only
```

`.env*` files are git-ignored. Never commit keys, and never expose the secret key to
client code.

### 4. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be sent to the login page.

## Project structure

The frontend is component-based: pages stay thin, features own their components and
hooks, and shared pieces live in one place.

```
src/
  app/                          Thin pages that only compose components
    page.tsx                    Documents dashboard
    login/page.tsx              Sign in / sign up
    chat/page.tsx               New chat
    chat/[chatId]/page.tsx      A saved chat
    api/documents/[id]/process/ POST route that processes an uploaded PDF
    api/chat/                   POST route: retrieve passages, stream a cited answer
    layout.tsx, globals.css     Root layout, theme script, Tailwind theme tokens
  components/
    ui/                         Button, Card, Alert, Spinner, SearchInput
    layout/                     AppShell, Sidebar, NavItem, AccountCard,
                                MobileHeader, PageHeader, PageContainer
    theme/                      ThemeToggle, ThemeButton, useTheme
    icons.tsx, Logo.tsx
  features/
    auth/                       Server actions + AuthForm, TextField, BrandPanel, ...
    documents/                  Hooks (useDocuments, useUploader) + Dropzone,
                                DocumentList, DocumentItem, DocumentStats, ...
    chat/                       useChat hook, ChatPanel, MessageList, AnswerText,
                                SourceChips, Composer + server/ (retrieve, prompt,
                                streamAnswer, validate)
    processing/                 Server-only pipeline: extractPages, chunkText, embed,
                                processDocument
  lib/
    supabase/                   Browser client, server client, useSupabase hook
    theme.ts                    Theme storage and the no-flash init script
  proxy.ts                      Session refresh and route protection
supabase/
  migrations/
    0001_init.sql               Schema, RLS policies, search function, storage bucket
```

## Theming

The two theme colors are defined once in `src/app/globals.css`:
`brand` (slate-navy) for structure and text, and `accent` (emerald) for actions and
highlights. Changing those values re-themes the whole app.

Dark mode is class-based (a `dark` class on `<html>`), so the user can choose Light,
Dark or System. The choice is stored in `localStorage` and applied by a small inline
script before first paint.

## Security notes

- Row Level Security protects every table, and storage policies restrict files to their owner.
- The service role key bypasses RLS, so it is used only in server code.
- Do not use real or sensitive documents with a free-tier AI key: prompts sent to the
  free Gemini tier may be used by Google to improve its products.

## Roadmap

- [x] Project setup (Next.js, TypeScript, Tailwind)
- [x] Supabase project, pgvector, schema and RLS
- [x] Authentication and protected routes
- [x] Branding and responsive UI for login and dashboard
- [x] Light, dark and system themes
- [x] PDF upload to private storage, document library, search and delete
- [x] Page-by-page text extraction, chunking and embeddings
- [x] Question answering with streamed responses and page citations
- [x] Chat history sidebar
- [ ] Workspaces
- [ ] Clickable citations that open the PDF at the right page
- [ ] Hybrid search, reranking and an evaluation set
- [ ] Tests, CI and deployment

## Acknowledgements

Inspired by the "chat with your PDF" pattern from the O'Reilly book *Learning LangChain*.
CiteWise is an independent project and shares no code with it.

## License

No license has been chosen yet.
