-- Enable pgvector extension (run once per database)
create extension if not exists vector;

-- ─────────────────────────────────────────────────────────────────────────────
-- The `chunks` and `documents` tables already exist in the Journaux database.
-- Schema (confirmed):
--   chunks    → id bigint, content text, metadata jsonb, embedding vector
--   documents → id bigint, content text, metadata jsonb, embedding vector
--
-- Only the match_chunks RPC function needs to be created.
-- Adjust the embedding dimension below if your vectors are not 1536-dim.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function match_chunks(
  query_embedding  vector(1536),   -- change to 3072 for text-embedding-3-large
  match_count      int     default 8,
  match_threshold  float   default 0.6
)
returns table (
  id          bigint,
  content     text,
  metadata    jsonb,
  similarity  float
)
language plpgsql stable
as $$
begin
  return query
  select
    c.id,
    c.content,
    c.metadata,
    1 - (c.embedding <=> query_embedding) as similarity
  from chunks c
  where 1 - (c.embedding <=> query_embedding) > match_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
end;
$$;
