import { embed } from 'ai'
import { openai } from '@ai-sdk/openai'
import { matchDocuments, type MatchResult } from './supabase'
import { parseChunkMeta } from './utils'
import type { JournalChunk, ChunkMetadata } from './types'

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
    return `Tu es VectorLens, un assistant de recherche spécialisé dans les archives du journal "Le Carnet de la fringale culturelle".
Réponds de manière précise et honnête. Si tu n'as pas assez de contexte, dis-le clairement.`
  }

  const contextBlock = chunks
    .map((c, i) => {
      const { source, date } = parseChunkMeta(c.metadata)
      const meta = [
        source ? `Source : ${source}` : '',
        date ? `Date : ${date}` : '',
      ]
        .filter(Boolean)
        .join(' | ')
      return `[Extrait ${i + 1}${meta ? ` — ${meta}` : ''}]\n${c.content}`
    })
    .join('\n\n---\n\n')

  return `Tu es VectorLens, un assistant de recherche avec accès aux archives de "Le Carnet de la fringale culturelle".

Utilise les extraits de journal ci-dessous pour répondre à la question de l'utilisateur. Cite les sources par leur numéro (ex. [1], [2]) lorsque tu les utilises. Sois précis et ancré dans le contexte fourni.

Si le contexte ne permet pas de répondre complètement, indique-le et partage ce que tu peux inférer.

## Extraits récupérés

${contextBlock}`
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toJournalChunk(r: MatchResult): JournalChunk {
  return {
    id: String(r.id),
    content: r.content,
    similarity: r.similarity,
    metadata: (r.metadata as ChunkMetadata) ?? null,
  }
}
