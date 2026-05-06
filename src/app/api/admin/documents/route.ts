import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('company_id')
    .eq('clerk_id', userId)
    .single()

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: documents } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('company_id', user.company_id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ documents: documents || [] })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, company_id')
    .eq('clerk_id', userId)
    .single()

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  // Read file content
  const text = await file.text()

  // Save document record
  const { data: document, error } = await supabaseAdmin
    .from('documents')
    .insert({
      company_id: user.company_id,
      uploaded_by: user.id,
      file_name: file.name,
      processed: false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send to AI service for processing
  try {
    await fetch('http://localhost:8000/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document_id: document.id,
        company_id: user.company_id,
        text,
      }),
    })
  } catch (e) {
    console.error('AI service error:', e)
  }

  return NextResponse.json({ success: true })
}