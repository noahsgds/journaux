# Supabase — Journaux

## Schéma confirmé

| Table | Colonnes |
|---|---|
| `chunks` | `id` bigint, `content` text, `metadata` jsonb, `embedding` vector |
| `documents` | `id` bigint, `content` text, `metadata` jsonb, `embedding` vector |

VectorLens effectue les recherches vectorielles sur la table **`chunks`**.

## Seule migration à appliquer

Crée la fonction RPC dans le SQL Editor de Supabase :

```sql
-- Adapte la dimension (1536, 3072, etc.) à celle de tes embeddings existants
create or replace function match_chunks(
  query_embedding  vector(1536),
  match_count      int   default 8,
  match_threshold  float default 0.6
)
returns table (id bigint, content text, metadata jsonb, similarity float)
language plpgsql stable as $$
begin
  return query
  select c.id, c.content, c.metadata,
         1 - (c.embedding <=> query_embedding) as similarity
  from chunks c
  where 1 - (c.embedding <=> query_embedding) > match_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

Puis crée la table des profils :

```sql
-- migrations/001_profiles.sql
```

## Variables d'environnement

```
NEXT_PUBLIC_SUPABASE_URL=https://bxpmlrkbumfrqqxwvtym.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé anon>
SUPABASE_SERVICE_ROLE_KEY=<clé service_role>
SUPABASE_DOCUMENTS_TABLE=chunks
SUPABASE_MATCH_FUNCTION=match_chunks
```
