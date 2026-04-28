// ─── Document / RAG ───────────────────────────────────────────────────────────

// Metadata from the `chunks` table in Journaux
// Three shapes exist: structured object | raw string | null
export type ChunkMetadata =
  | {
      date?: string         // e.g. "28 Avril 2026"
      source?: string       // e.g. "Le Carnet de la fringale culturelle N164"
      chunk_index?: number
      chars?: number
      [key: string]: unknown
    }
  | string   // legacy: source+date concatenated
  | null

export interface JournalChunk {
  id: string
  content: string
  similarity: number
  metadata: ChunkMetadata
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: JournalChunk[]
  createdAt: Date
}

// ─── Profiles ─────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  name: string
  subjects: string[]
  color: string
  created_at: string
  updated_at: string
}

export interface FocusResult {
  subject: string
  chunks: JournalChunk[]
}

// ─── API payloads ─────────────────────────────────────────────────────────────

export interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[]
}

export interface SearchRequest {
  query: string
  matchCount?: number
  matchThreshold?: number
}

export interface FocusFeedRequest {
  subjects: string[]
  matchCount?: number
  matchThreshold?: number
}

export interface ProfileCreate {
  name: string
  subjects: string[]
  color?: string
}

export interface ProfileUpdate extends Partial<ProfileCreate> {}
