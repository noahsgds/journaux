import { streamText, StreamData } from 'ai'
import type { CoreMessage } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { retrieveChunks, buildSystemPrompt } from '@/lib/rag'
import type { JournalChunk } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60

// Resolve the generation model and provider.
// Priority: GROQ_API_KEY (free) → groq/llama  |  GOOGLE_GENERATIVE_AI_API_KEY → gemini
function resolveModel() {
  if (process.env.GROQ_API_KEY) {
    // Groq exposes an OpenAI-compatible API — no extra SDK needed
    const groq = createOpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
    })
    const modelId = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile'
    return groq(modelId)
  }
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const modelId = process.env.GENERATION_MODEL ?? 'gemini-2.0-flash'
    return google(modelId)
  }
  return null
}

export async function POST(req: Request) {
  const model = resolveModel()
  if (!model) {
    return new Response(
      JSON.stringify({
        error:
          'Aucune clé API configurée. Ajoutez GROQ_API_KEY (gratuit sur console.groq.com) ou GOOGLE_GENERATIVE_AI_API_KEY dans les variables Vercel.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response('Corps de requête invalide', { status: 400 })
  }

  const { messages } = body as { messages?: CoreMessage[] }

  if (!messages?.length) {
    return new Response('messages requis', { status: 400 })
  }

  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === 'user') as { role: 'user'; content: string } | undefined

  // RAG retrieval — failure is non-fatal, generation continues without context
  let chunks: JournalChunk[] = []
  let ragError: string | null = null
  try {
    if (lastUserMessage?.content) {
      chunks = await retrieveChunks(lastUserMessage.content, 8, 0.55)
    }
  } catch (err) {
    ragError = err instanceof Error ? err.message : 'Erreur de récupération RAG'
    console.error('[TomKiosque] RAG retrieval failed:', ragError)
  }

  const systemPrompt = buildSystemPrompt(chunks, ragError)
  const data = new StreamData()
  data.append(JSON.parse(JSON.stringify({
    sources: chunks,
    ragError: ragError ?? undefined,
    ragWorked: chunks.length > 0,
  })))

  try {
    const result = await streamText({
      model,
      system: systemPrompt,
      messages,
      temperature: 0.3,
      maxTokens: 1500,
      onFinish() {
        data.close()
      },
    })
    return result.toAIStreamResponse({ data })
  } catch (err) {
    data.close()
    const message =
      err instanceof Error ? err.message : 'Erreur de génération inconnue'
    console.error('[TomKiosque] streamText failed:', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}
