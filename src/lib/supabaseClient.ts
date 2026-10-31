import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && anonKey)

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  if (!client) {
    client = createClient(url!, anonKey!)
  }
  return client
}

export type DbRabbit = {
  id: string
  user_id: string
  name: string
  age_label: string | null
  breed: string | null
  weight: number | null
  avatar: string | null
  notes: string | null
  diary_title: string | null
  custom_topics: string[] | null
}

export type DbLog = {
  rabbit_id: string
  log_date: string
  appetite: string | null
  poop: string | null
  activity: string | null
  weight: number | null
  teeth: string | null
  pain: string | null
  notes: string | null
}

export type DbSettings = {
  user_id: string
  active_rabbit_id: string | null
}
