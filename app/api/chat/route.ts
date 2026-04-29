import { streamText, StreamData } from 'ai'
import type { CoreMessage } from 'ai'
import { google } from '@ai-sdk/google'
import { retrieveChunks, buildSystemPrompt } from '@/lib/rag'
import type { JournalChunk } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: Request) {
  // Guard: API key must be present
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'GOOGLE_GENERATIVE_AI_API_KEY manquant. Configurez la variable dans Vercel ou .env.local.' }),
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
  try {
    if (lastUserMessage?.content) {
      chunks = await retrieveChunks(lastUserMessage.content, 8, 0.55)
    }
  } catch (err) {
    console.error('[TomKiosque] RAG retrieval failed:', err)
  }

  const systemPrompt = buildSystemPrompt(chunks)
  const data = new StreamData()
  data.append(JSON.parse(JSON.stringify({ sources: chunks })))

  const model = process.env.GENERATION_MODEL ?? 'gemini-2.0-flash'

  try {
    const result = await streamText({
      model: google(model),
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
