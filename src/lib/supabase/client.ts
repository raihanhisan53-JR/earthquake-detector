import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Fallback atau error handling yang lebih baik di client-side
    console.error('Supabase client keys are missing')
  }

  return createBrowserClient(
    url || 'https://placeholder.supabase.co',
    key || 'placeholder'
  )
}
