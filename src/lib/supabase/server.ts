import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Bersihkan URL jika ada /rest/v1/ atau garis miring di ujung
  if (url) {
    url = url.split('/rest/v1')[0].replace(/\/$/, '')
  }

  const isValidUrl = url && url.startsWith('http')

  return createServerClient(
    (isValidUrl ? url : 'https://placeholder-project.supabase.co') as string,
    (key || 'placeholder-key') as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
