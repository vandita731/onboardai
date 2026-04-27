import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, CheckCircle, Clock } from 'lucide-react'

export default async function EmployeeDashboard() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*, companies(*)')
    .eq('clerk_id', userId)
    .single()

  if (!user) redirect('/onboarding')
  if (user.role === 'admin') redirect('/admin')

  const { data: tasks } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('assigned_to', user.id)
    .order('created_at', { ascending: false })

  const completed = tasks?.filter(t => t.status === 'completed').length ?? 0
  const pending = tasks?.filter(t => t.status === 'pending').length ?? 0
  const total = tasks?.length ?? 0

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Welcome, {user.name} 👋</h1>
          <p className="text-muted-foreground">
            {user.companies?.name} · Here's your onboarding progress
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completed}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pending}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tasks List */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Your Tasks</h2>
          {tasks && tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    )}
                    {task.due_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge variant={
                    task.status === 'completed' ? 'default' :
                    task.status === 'in_progress' ? 'secondary' : 'outline'
                  }>
                    {task.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No tasks assigned yet.</p>
              <p className="text-sm">Your manager will assign tasks soon.</p>
            </div>
          )}
        </Card>

      </div>
    </div>
  )
}