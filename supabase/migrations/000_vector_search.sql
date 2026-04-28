-- Enable pgvector extension (run once per database)
create extension if not exists vector;

-- ─────────────────────────────────────────────────────────────────────────────
-- Tables confirmed in the Journaux database:
--   chunks    → id bigint, content text, metadata jsonb, embedding vector(3072)
--   documents → id bigint, content text, metadata jsonb, embedding vector(3072)
--
-- Embeddings were created by n8n using OpenAI text-embedding-3-large (3072 dims).
-- VectorLens uses the same model for query embedding to ensure compatibility.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function match_chunks(
  query_embedding  vector(3072),
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
