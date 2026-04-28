import { streamText, StreamData } from 'ai'
import { google } from '@ai-sdk/google'
import { retrieveChunks, buildSystemPrompt } from '@/lib/rag'
import type { JournalChunk } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: Request) {
  const { messages } = await req.json()

  if (!messages?.length) {
    return new Response('messages required', { status: 400 })
  }

  const lastUserMessage = [...messages]
    .reverse()
    .find((m: { role: string }) => m.role === 'user')

  // Retrieve relevant journal chunks for the latest user question
  let chunks: JournalChunk[] = []
  try {
    if (lastUserMessage?.content) {
      chunks = await retrieveChunks(lastUserMessage.content, 8, 0.55)
    }
  } catch (err) {
    console.error('RAG retrieval failed, continuing without context:', err)
  }

  const systemPrompt = buildSystemPrompt(chunks)

  // Stream sources alongside the text response
  const data = new StreamData()
  data.append(JSON.parse(JSON.stringify({ sources: chunks })))

  const model = process.env.GENERATION_MODEL ?? 'gemini-2.0-flash'

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
}
