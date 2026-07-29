import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

const isConfigured = !!(supabaseUrl && supabaseAnonKey)

let client: ReturnType<typeof createClient> | null = null

if (isConfigured && typeof window !== 'undefined') {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

export const supabase = client
export const supabaseConfigured = isConfigured
