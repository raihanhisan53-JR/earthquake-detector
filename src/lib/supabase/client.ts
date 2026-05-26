import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Bersihkan URL jika ada /rest/v1/ atau garis miring di ujung
  if (url) {
    url = url.split('/rest/v1')[0].replace(/\/$/, '')
  }

  const isValidUrl = url && url.startsWith('http')

  return createBrowserClient(
    (isValidUrl ? url : 'https://placeholder-project.supabase.co') as string,
    (key || 'placeholder-key') as string
  )
}
