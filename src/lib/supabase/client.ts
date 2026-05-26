import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Cek apakah URL valid (harus mulai dengan http)
  const isValidUrl = url && url.startsWith('http')

  return createBrowserClient(
    isValidUrl ? url : 'https://placeholder-project.supabase.co',
    key || 'placeholder-key'
  )
}
