import Dashboard from '@/components/Dashboard'
import LandingPage from '@/components/LandingPage'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <LandingPage />
  }

  return <Dashboard user={user} />
}
