# VectorLens

A RAG-powered knowledge platform for exploring journal archives via semantic search and AI-generated answers.

## Features

- **Journal Q&A** — Ask natural-language questions; answers are grounded in retrieved journal excerpts with source citations
- **Subject Profiles** — Create person profiles with subject areas; get a ranked focus feed of relevant passages per subject

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| UI | shadcn/ui (custom dark theme) |
| Database | Supabase (pgvector) |
| Embeddings | OpenAI `text-embedding-3-small` |
| Generation | Anthropic Claude (`claude-sonnet-4-6`) |
| Deployment | Vercel |

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Fill in Supabase and API keys

# 3. Apply Supabase migrations
# See supabase/README.md

# 4. Start dev server
npm run dev
```

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) |
| `ANTHROPIC_API_KEY` | Claude API key |
| `OPENAI_API_KEY` | OpenAI API key (for embeddings) |
| `SUPABASE_DOCUMENTS_TABLE` | Table name (default: `journal_entries`) |
| `SUPABASE_MATCH_FUNCTION` | RPC function name (default: `match_documents`) |
| `EMBEDDING_MODEL` | Embedding model (default: `text-embedding-3-small`) |
| `EMBEDDING_DIMENSIONS` | Vector dimensions (default: `1536`) |
| `GENERATION_MODEL` | Claude model (default: `claude-sonnet-4-6`) |

## Architecture

```
User Query
    │
    ▼
/api/chat
    ├── Embed query (OpenAI)
    ├── Vector search (Supabase pgvector)
    │       └── match_documents RPC
    └── Stream answer (Anthropic Claude)
            └── Context = retrieved chunks
```
