import { createClient } from '@/lib/supabase/client'

export type FoodEntry = {
  id: string;
  food: string;
  quantity?: string | null;
  datetime: string; // ISO
  comment?: string | null;
  created_at?: string;
};

export async function fetchFoodEntries(): Promise<FoodEntry[]> {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  let userId = userData?.user?.id
  if (!userId) {
    const { data: sessionData } = await supabase.auth.getSession()
    userId = sessionData?.session?.user?.id
  }
  if (!userId) return []
  const { data, error } = await supabase
    .from<FoodEntry>('food_entries')
    .select('*')
    .eq('user_id', userId)
    .order('datetime', { ascending: false })
  if (error) throw error
  return data || []
}

export async function insertFoodEntry(entry: {
  food: string;
  quantity?: string | null;
  datetime: string;
  comment?: string | null;
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
    .from('food_entries')
    .insert([{ ...entry, user_id: userId }])
  if (error) throw error
  return data
}

export async function updateFoodEntry(id: string, updates: Partial<FoodEntry>) {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  let userId = userData?.user?.id
  if (!userId) {
    const { data: sessionData } = await supabase.auth.getSession()
    userId = sessionData?.session?.user?.id
  }
  if (!userId) throw new Error('Not authenticated')
  const { data, error } = await supabase
    .from('food_entries')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
  return data
}

export async function deleteFoodEntry(id: string) {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id
  if (!userId) throw new Error('Not authenticated')
  const { data, error } = await supabase
    .from('food_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
  return data
}

export async function distinctFoodNames(): Promise<string[]> {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  let userId = userData?.user?.id
  if (!userId) {
    const { data: sessionData } = await supabase.auth.getSession()
    userId = sessionData?.session?.user?.id
  }
  if (!userId) return []
  const { data, error } = await supabase
    .from('food_entries')
    .select('food')
    .eq('user_id', userId)
    .order('food', { ascending: true })
  if (error) throw error
  const set = new Set<string>()
  ;(data || []).forEach((r: any) => {
    if (r.food) set.add(r.food)
  })
  return Array.from(set)
}