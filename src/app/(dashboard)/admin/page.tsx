import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Users, ClipboardList, Building2 } from 'lucide-react'

export default async function AdminDashboard() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // Get user from DB
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*, companies(*)')
    .eq('clerk_id', userId)
    .single()

  if (!user) redirect('/onboarding')
  if (user.role !== 'admin') redirect('/dashboard/employee')

  // Get stats
  const { count: employeeCount } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', user.company_id)
    .eq('role', 'employee')

  const { count: taskCount } = await supabaseAdmin
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', user.company_id)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            {user.companies?.name} · Welcome back, {user.name}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="text-2xl font-bold">{employeeCount ?? 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{taskCount ?? 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Company ID</p>
                <p className="text-xs font-mono font-bold truncate">{user.company_id}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Invite Code Box */}
        <Card className="p-6">
          <h2 className="font-semibold mb-2">Employee Invite Code</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Share this code with new hires so they can join your workspace
          </p>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm break-all">
            {user.company_id}
          </div>
        </Card>

      </div>
    </div>
  )
}