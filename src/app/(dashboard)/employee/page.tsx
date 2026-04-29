'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ClipboardList, CheckCircle, Clock, Loader2 } from 'lucide-react'

type Task = {
  id: string
  title: string
  description: string
  status: string
  due_date: string
}

type User = {
  name: string
  companies: { name: string }
}

export default function EmployeeDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [userRes, taskRes] = await Promise.all([
      fetch('/api/employee/me'),
      fetch('/api/employee/tasks'),
    ])
    const userData = await userRes.json()
    const taskData = await taskRes.json()
    setUser(userData.user)
    setTasks(taskData.tasks || [])
    setLoading(false)
  }

  const markComplete = async (taskId: string) => {
    setUpdating(taskId)
    await fetch('/api/employee/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, status: 'completed' }),
    })
    await fetchData()
    setUpdating(null)
  }

  const completed = tasks.filter(t => t.status === 'completed').length
  const pending = tasks.filter(t => t.status === 'pending').length
  const total = tasks.length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Welcome, {user?.name} 👋</h1>
          <p className="text-muted-foreground">
            {user?.companies?.name} · Here's your onboarding progress
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium">Overall Progress</p>
            <p className="text-sm font-bold text-primary">{progress}%</p>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {completed} of {total} tasks completed
          </p>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    )}
                    {task.due_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Badge variant={
                      task.status === 'completed' ? 'default' :
                      task.status === 'in_progress' ? 'secondary' : 'outline'
                    }>
                      {task.status}
                    </Badge>
                    {task.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markComplete(task.id)}
                        disabled={updating === task.id}
                        className="gap-1"
                      >
                        {updating === task.id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <CheckCircle className="w-3 h-3" />
                        }
                        Done
                      </Button>
                    )}
                  </div>
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