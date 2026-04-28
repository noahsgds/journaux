# Supabase Setup

## 1. Run migrations

Apply these SQL files in order in the Supabase SQL editor or via the CLI:

```bash
supabase db push
# or apply manually:
# 000_vector_search.sql  — pgvector + match_documents RPC
# 001_profiles.sql       — profiles table
```

## 2. Existing journal data

If your journal entries table has a different name or column layout, update:

- `SUPABASE_DOCUMENTS_TABLE` in `.env.local`
- `SUPABASE_MATCH_FUNCTION` (defaults to `match_documents`)
- `EMBEDDING_DIMENSIONS` (1536 for OpenAI ada-002 / text-embedding-3-small)

## 3. Match function signature

The app calls:
```sql
select * from match_documents(
  query_embedding  => <vector>,
  match_count      => 8,
  match_threshold  => 0.6
);
```

Expected return columns: `id`, `content`, `metadata` (jsonb), `similarity` (float).
