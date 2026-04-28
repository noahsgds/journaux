import { retrieveChunks } from '@/lib/rag'
import type { SearchRequest } from '@/lib/types'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { query, matchCount = 8, matchThreshold = 0.6 }: SearchRequest =
    await req.json()

  if (!query?.trim()) {
    return Response.json({ error: 'query required' }, { status: 400 })
  }

  const chunks = await retrieveChunks(query, matchCount, matchThreshold)
  return Response.json({ chunks })
}
