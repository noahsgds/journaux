// ─── Document / RAG ───────────────────────────────────────────────────────────

export interface JournalChunk {
  id: string
  content: string
  similarity: number
  metadata: {
    date?: string
    source?: string
    title?: string
    tags?: string[]
    [key: string]: unknown
  }
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
