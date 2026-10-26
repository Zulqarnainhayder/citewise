-- CiteWise initial schema
-- Embeddings: Gemini gemini-embedding-001 at 768 dimensions.
-- Run in the Supabase SQL Editor (or via the Supabase CLI).

create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workspace_id uuid references public.workspaces (id) on delete set null,
  title text not null,
  storage_path text not null,            -- path inside the "documents" bucket
  page_count int,
  language text,                         -- e.g. 'en', 'de'
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'ready', 'failed')),
  summary text,
  suggested_questions text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  page_number int not null,              -- 1-based; powers page citations
  chunk_index int not null,              -- order within the document
  content text not null,
  embedding vector(768),
  content_tsv tsvector generated always as (to_tsvector('simple', content)) stored,
  created_at timestamptz not null default now()
);

create table public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workspace_id uuid references public.workspaces (id) on delete set null,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  -- [{ "chunk_id": "...", "document_id": "...", "page_number": 3, "snippet": "..." }]
  sources jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index documents_user_idx on public.documents (user_id);
create index documents_workspace_idx on public.documents (workspace_id);
create index chunks_document_idx on public.chunks (document_id, page_number);
create index chunks_user_idx on public.chunks (user_id);
create index chunks_embedding_idx on public.chunks
  using hnsw (embedding vector_cosine_ops);
create index chunks_tsv_idx on public.chunks using gin (content_tsv);
create index chats_user_idx on public.chats (user_id, updated_at desc);
create index messages_chat_idx on public.messages (chat_id, created_at);

-- ---------------------------------------------------------------------------
-- Row Level Security: users only touch their own rows.
-- Server code using the service role key bypasses these policies.
-- ---------------------------------------------------------------------------

alter table public.workspaces enable row level security;
alter table public.documents enable row level security;
alter table public.chunks enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;

create policy "own workspaces" on public.workspaces
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "own documents" on public.documents
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      workspace_id is null
      or exists (
        select 1 from public.workspaces w
        where w.id = workspace_id and w.user_id = (select auth.uid())
      )
    )
  );

create policy "own chunks" on public.chunks
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.documents d
      where d.id = document_id and d.user_id = (select auth.uid())
    )
  );

create policy "own chats" on public.chats
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      workspace_id is null
      or exists (
        select 1 from public.workspaces w
        where w.id = workspace_id and w.user_id = (select auth.uid())
      )
    )
  );

create policy "own messages" on public.messages
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.chats c
      where c.id = chat_id and c.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Vector search. SECURITY INVOKER (default) so RLS applies to the caller.
-- ---------------------------------------------------------------------------

create or replace function public.match_chunks (
  query_embedding vector(768),
  match_count int default 5,
  filter_document_ids uuid[] default null,
  filter_workspace_id uuid default null
)
returns table (
  id uuid,
  document_id uuid,
  page_number int,
  content text,
  similarity float
)
language sql
stable
set search_path = public, extensions
as $$
  select
    c.id,
    c.document_id,
    c.page_number,
    c.content,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.chunks c
  join public.documents d on d.id = c.document_id
  where (filter_document_ids is null or c.document_id = any (filter_document_ids))
    and (filter_workspace_id is null or d.workspace_id = filter_workspace_id)
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- ---------------------------------------------------------------------------
-- Storage: private "documents" bucket, files stored under "<user_id>/..."
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

create policy "own files read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "own files upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "own files delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
