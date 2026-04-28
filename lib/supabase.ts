import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Public client (safe for browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side admin client (never expose to browser)
export function createAdminClient() {
  const key = supabaseServiceKey ?? supabaseAnonKey
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false },
  })
}

// ─── Vector search ────────────────────────────────────────────────────────────

export interface MatchResult {
  id: string
  content: string
  metadata: Record<string, unknown>
  similarity: number
}

export async function matchDocuments(
  queryEmbedding: number[],
  matchCount = 8,
  matchThreshold = 0.6,
): Promise<MatchResult[]> {
  const admin = createAdminClient()
  const fn = process.env.SUPABASE_MATCH_FUNCTION ?? 'match_chunks'

  const { data, error } = await admin.rpc(fn, {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    match_threshold: matchThreshold,
  })

  if (error) throw new Error(`Supabase RPC error: ${error.message}`)
  return (data ?? []) as MatchResult[]
}

// ─── Profiles CRUD ────────────────────────────────────────────────────────────

export async function getProfiles() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createProfile(payload: {
  name: string
  subjects: string[]
  color: string
}) {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(
  id: string,
  payload: { name?: string; subjects?: string[]; color?: string },
) {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProfile(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from('profiles').delete().eq('id', id)
  if (error) throw error
}
