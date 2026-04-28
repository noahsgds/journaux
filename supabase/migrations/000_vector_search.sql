-- Enable pgvector extension (run once per database)
create extension if not exists vector;

-- ─────────────────────────────────────────────────────────────────────────────
-- Journal entries table
-- Adjust to match your existing schema — this is the reference shape.
-- If the table already exists with embeddings, skip the CREATE TABLE block
-- and only add the match_documents function below.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists journal_entries (
  id         bigserial primary key,
  content    text        not null,
  embedding  vector(1536),           -- change dimension to match your model
  metadata   jsonb       not null default '{}',
  created_at timestamptz not null default now()
);

-- Index for fast ANN search (IVFFlat — tune lists to ~sqrt(row_count))
create index if not exists journal_entries_embedding_idx
  on journal_entries
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ─────────────────────────────────────────────────────────────────────────────
-- Similarity search function
-- Called by the app via supabase.rpc('match_documents', { ... })
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function match_documents(
  query_embedding  vector(1536),
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
    je.id::bigint,
    je.content,
    je.metadata,
    1 - (je.embedding <=> query_embedding) as similarity
  from journal_entries je
  where 1 - (je.embedding <=> query_embedding) > match_threshold
  order by je.embedding <=> query_embedding
  limit match_count;
end;
$$;
