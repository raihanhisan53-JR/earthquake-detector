import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await prisma.earthquakeLog.delete({ where: { id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    console.error('DELETE /api/earthquakes/[id] error:', error)
    return NextResponse.json({ error: 'Gagal menghapus' }, { status: 500 })
  }
}
