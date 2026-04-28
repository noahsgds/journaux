import { embed } from 'ai'
import { openai } from '@ai-sdk/openai'
import { matchDocuments, type MatchResult } from './supabase'
import type { JournalChunk } from './types'

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = parseInt(
  process.env.EMBEDDING_DIMENSIONS ?? '1536',
  10,
)

// ─── Embedding ────────────────────────────────────────────────────────────────

export async function getEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding(EMBEDDING_MODEL, {
      dimensions: EMBEDDING_DIMENSIONS,
    }),
    value: text.replace(/\n+/g, ' ').trim(),
  })
  return embedding
}

// ─── Retrieval ────────────────────────────────────────────────────────────────

export async function retrieveChunks(
  query: string,
  matchCount = 8,
  matchThreshold = 0.6,
): Promise<JournalChunk[]> {
  const embedding = await getEmbedding(query)
  const results = await matchDocuments(embedding, matchCount, matchThreshold)
  return results.map(toJournalChunk)
}

export async function retrieveChunksForSubjects(
  subjects: string[],
  matchCount = 5,
  matchThreshold = 0.55,
): Promise<{ subject: string; chunks: JournalChunk[] }[]> {
  const results = await Promise.all(
    subjects.map(async (subject) => {
      const chunks = await retrieveChunks(subject, matchCount, matchThreshold)
      return { subject, chunks }
    }),
  )
  return results
}

// ─── Prompt construction ──────────────────────────────────────────────────────

export function buildSystemPrompt(chunks: JournalChunk[]): string {
  if (chunks.length === 0) {
    return `You are VectorLens, an intelligent research assistant for journal archives.
Answer questions thoughtfully. If you don't have relevant context, say so honestly.`
  }

  const contextBlock = chunks
    .map((c, i) => {
      const meta = [
        c.metadata.date ? `Date: ${c.metadata.date}` : '',
        c.metadata.source ? `Source: ${c.metadata.source}` : '',
      ]
        .filter(Boolean)
        .join(' | ')
      return `[Source ${i + 1}${meta ? ` — ${meta}` : ''}]\n${c.content}`
    })
    .join('\n\n---\n\n')

  return `You are VectorLens, an intelligent research assistant with access to a curated archive of journal entries.

Use the following retrieved journal excerpts to answer the user's question. Cite sources by their number (e.g., [1], [2]) when you use them. Be precise and grounded in the provided context.

If the context doesn't contain enough information to answer fully, say so and share what you can infer.

## Retrieved Context

${contextBlock}`
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toJournalChunk(r: MatchResult): JournalChunk {
  return {
    id: String(r.id),
    content: r.content,
    similarity: r.similarity,
    metadata: (r.metadata as JournalChunk['metadata']) ?? {},
  }
}
