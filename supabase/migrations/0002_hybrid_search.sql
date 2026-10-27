-- CiteWise hybrid search: the keyword half.
-- Run in the Supabase SQL Editor after 0001_init.sql. Safe to run more than once.
--
-- chunks.content_tsv (full-text index, 'simple' config) already exists from 0001.
-- This adds a function that ranks chunks by how well they match a list of keywords.
-- Any one keyword may match (OR), and chunks matching more of them rank higher.
-- SECURITY INVOKER (default), so row level security applies to the caller.

create or replace function public.keyword_match_chunks (
  query_terms text[],
  match_count int default 5,
  filter_document_ids uuid[] default null
)
returns table (
  id uuid,
  document_id uuid,
  page_number int,
  content text,
  rank float
)
language sql
stable
set search_path = public, extensions
as $$
  with parts as (
    -- websearch_to_tsquery never raises a syntax error, whatever the user typed.
    select websearch_to_tsquery('simple', t)::text as part
    from unnest(query_terms) as t
  ),
  joined as (
    select string_agg(part, ' | ') as text_query
    from parts
    where part <> ''
  ),
  q as (
    select to_tsquery('simple', text_query) as query
    from joined
    where text_query is not null
  )
  select
    c.id,
    c.document_id,
    c.page_number,
    c.content,
    ts_rank_cd(c.content_tsv, q.query, 1)::float as rank
  from public.chunks c
  cross join q
  where c.content_tsv @@ q.query
    and (filter_document_ids is null or c.document_id = any (filter_document_ids))
  order by rank desc
  limit match_count;
$$;
