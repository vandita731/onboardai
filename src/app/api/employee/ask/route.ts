import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { question } = await req.json()

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, company_id')
    .eq('clerk_id', userId)
    .single()

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const res = await fetch('http://localhost:8000/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        company_id: user.company_id,
        user_id: user.id,
      }),
    })

    const data = await res.json()
    return NextResponse.json({ answer: data.answer })

  } catch (e) {
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 })
  }
}