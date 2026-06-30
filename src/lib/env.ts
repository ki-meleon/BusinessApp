import { createServerClient } from '@/lib/supabase/server'

const ENV_FALLBACK: Record<string, string | undefined> = {
  n8n_webhook_send_offer: process.env.N8N_WEBHOOK_SEND_OFFER,
}

export async function getSetting(key: string): Promise<string> {
  const supabase = createServerClient()
  const { data } = await supabase.from('app_settings').select('value').eq('key', key).maybeSingle()
  const dbValue = data?.value?.trim()
  if (dbValue) return dbValue
  return ENV_FALLBACK[key] ?? ''
}
