import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: admin } = await supabaseAdmin
    .from('users')
    .select('company_id')
    .eq('clerk_id', userId)
    .single()

  if (!admin) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: employees } = await supabaseAdmin
    .from('users')
    .select('id, name, email')
    .eq('company_id', admin.company_id)
    .eq('role', 'employee')

  return NextResponse.json({ employees: employees || [] })
}