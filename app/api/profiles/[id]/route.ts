import { updateProfile, deleteProfile } from '@/lib/supabase'
import type { ProfileUpdate } from '@/lib/types'

export const runtime = 'nodejs'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const payload: ProfileUpdate = await req.json()
  const profile = await updateProfile(params.id, payload)
  return Response.json({ profile })
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  await deleteProfile(params.id)
  return new Response(null, { status: 204 })
}
