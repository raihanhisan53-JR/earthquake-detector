import Dashboard from '@/components/Dashboard'
import LandingPage from '@/components/LandingPage'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function Home() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return <LandingPage />
    }

    return <Dashboard user={user} />
  } catch (error) {
    console.error('Runtime error in Home:', error)
    // Fallback ke LandingPage jika ada error auth (misal: env missing)
    return <LandingPage />
  }
}
