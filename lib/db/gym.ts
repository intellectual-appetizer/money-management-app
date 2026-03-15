import { createClient } from '@/lib/supabase/client'

export type GymEntry = {
  id: string;
  exercise: string;
  reps: number;
  sets: number;
  datetime: string; // ISO
  comment?: string | null;
  created_at?: string;
};

export async function fetchGymEntries(): Promise<GymEntry[]> {
  const supabase = createClient()
  // Prefer current user; fallback to session if needed
  const { data: userData } = await supabase.auth.getUser()
  let userId = userData?.user?.id
  if (!userId) {
    const { data: sessionData } = await supabase.auth.getSession()
    userId = sessionData?.session?.user?.id
  }
  if (!userId) return []
  const { data, error } = await supabase
    .from<GymEntry>('gym_entries')
    .select('*')
    .eq('user_id', userId)
    .order('datetime', { ascending: false })
  if (error) throw error
  return data || []
}

export async function insertGymEntry(entry: {
  exercise: string
  reps: number
  sets?: number
  datetime: string // ISO string
  comment?: string | null
}) {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  let userId = userData?.user?.id
  if (!userId) {
    const { data: sessionData } = await supabase.auth.getSession()
    userId = sessionData?.session?.user?.id
  }
  if (!userId) throw new Error('Not authenticated')
  const { data, error } = await supabase
    .from('gym_entries')
    .insert([{ ...entry, user_id: userId }])
  if (error) throw error
  return data
}

export async function updateGymEntry(id: string, updates: Partial<GymEntry>) {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  let userId = userData?.user?.id
  if (!userId) {
    const { data: sessionData } = await supabase.auth.getSession()
    userId = sessionData?.session?.user?.id
  }
  if (!userId) throw new Error('Not authenticated')
  const { data, error } = await supabase
    .from('gym_entries')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
  return data
}

export async function deleteGymEntry(id: string) {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  let userId = userData?.user?.id
  if (!userId) {
    const { data: sessionData } = await supabase.auth.getSession()
    userId = sessionData?.session?.user?.id
  }
  if (!userId) throw new Error('Not authenticated')
  const { data, error } = await supabase
    .from('gym_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
  return data
}

export async function distinctExercises(): Promise<string[]> {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id
  if (!userId) return []
  const { data, error } = await supabase
    .from('gym_entries')
    .select('exercise')
    .eq('user_id', userId)
    .order('exercise', { ascending: true })
  if (error) throw error
  const set = new Set<string>()
  ;(data || []).forEach((r: any) => {
    if (r.exercise) set.add(r.exercise)
  })
  return Array.from(set)
}