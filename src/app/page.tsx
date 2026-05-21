import Dashboard from '@/components/Dashboard'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: '#94a3b8', fontFamily: 'system-ui, sans-serif' }}>
        <p>Redirecting to login...</p>
      </div>
    )
  }

  return <Dashboard user={user} />
}
