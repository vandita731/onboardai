import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { role, companyName, inviteCode, clerkId, name, email } = await req.json()

    if (!clerkId || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (role === 'admin') {
      // Create company
      const { data: company, error: companyError } = await supabaseAdmin
        .from('companies')
        .insert({ name: companyName })
        .select()
        .single()

      if (companyError) throw companyError

      // Create user as admin
      const { error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          company_id: company.id,
          clerk_id: clerkId,
          role: 'admin',
          name,
          email,
        })

      if (userError) throw userError

      return NextResponse.json({ success: true, companyId: company.id })
    }

    if (role === 'employee') {
      // Find company by invite code
      // For now invite code = company id (we'll make it fancy later)
      const { data: company, error: companyError } = await supabaseAdmin
        .from('companies')
        .select()
        .eq('id', inviteCode)
        .single()

      if (companyError || !company) {
        return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
      }

      // Create user as employee
      const { error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          company_id: company.id,
          clerk_id: clerkId,
          role: 'employee',
          name,
          email,
        })

      if (userError) throw userError

      return NextResponse.json({ success: true, companyId: company.id })
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })

  } catch (error: any) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}