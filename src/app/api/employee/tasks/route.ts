import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!user) return NextResponse.json({ tasks: [] })

  const { data: tasks } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('assigned_to', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ tasks: tasks || [] })
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId, status } = await req.json()

  const { error } = await supabaseAdmin
    .from('tasks')
    .update({ status })
    .eq('id', taskId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}