import { getProfiles, createProfile } from '@/lib/supabase'
import { PROFILE_COLORS } from '@/lib/utils'
import type { ProfileCreate } from '@/lib/types'

export const runtime = 'nodejs'

export async function GET() {
  const profiles = await getProfiles()
  return Response.json({ profiles })
}

export async function POST(req: Request) {
  const { name, subjects, color }: ProfileCreate = await req.json()

  if (!name?.trim()) {
    return Response.json({ error: 'name required' }, { status: 400 })
  }

  const profile = await createProfile({
    name: name.trim(),
    subjects: (subjects ?? []).map((s) => s.trim()).filter(Boolean),
    color: color ?? PROFILE_COLORS[Math.floor(Math.random() * PROFILE_COLORS.length)],
  })

  return Response.json({ profile }, { status: 201 })
}
