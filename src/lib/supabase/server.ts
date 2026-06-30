import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Single-user, local-only app: no auth/session handling needed.
// Server-side code talks to Supabase directly with the service role key.
export function createServerClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}
