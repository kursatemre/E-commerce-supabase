import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let singletonClient: SupabaseClient | null = null

export function canUseServiceClient() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export function getServiceClient() {
  if (singletonClient) {
    return singletonClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase service role bilgileri eksik (NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY)')
  }

  singletonClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  })

  return singletonClient
}
