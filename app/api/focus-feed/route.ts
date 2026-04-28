import { retrieveChunksForSubjects } from '@/lib/rag'
import type { FocusFeedRequest } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: Request) {
  const {
    subjects,
    matchCount = 5,
    matchThreshold = 0.5,
  }: FocusFeedRequest = await req.json()

  if (!Array.isArray(subjects) || subjects.length === 0) {
    return Response.json({ error: 'subjects array required' }, { status: 400 })
  }

  const results = await retrieveChunksForSubjects(
    subjects,
    matchCount,
    matchThreshold,
  )
  return Response.json({ results })
}
