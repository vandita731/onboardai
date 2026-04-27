import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: admin } = await supabaseAdmin
    .from('users')
    .select('id, company_id')
    .eq('clerk_id', userId)
    .single()

  if (!admin) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: tasks } = await supabaseAdmin
    .from('tasks')
    .select('*, users!tasks_assigned_to_fkey(name)')
    .eq('company_id', admin.company_id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ tasks: tasks || [] })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, due_date, assigned_to } = await req.json()

  const { data: admin } = await supabaseAdmin
    .from('users')
    .select('id, company_id')
    .eq('clerk_id', userId)
    .single()

  if (!admin) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabaseAdmin
    .from('tasks')
    .insert({
      title,
      description,
      due_date: due_date || null,
      assigned_to,
      assigned_by: admin.id,
      company_id: admin.company_id,
      status: 'pending',
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}