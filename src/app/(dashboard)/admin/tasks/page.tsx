'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, Plus, Loader2, X } from 'lucide-react'

type Employee = {
  id: string
  name: string
  email: string
}

type Task = {
  id: string
  title: string
  description: string
  status: string
  due_date: string
  users: { name: string }
}

export default function TasksPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    due_date: '',
    assigned_to: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [empRes, taskRes] = await Promise.all([
      fetch('/api/admin/employees'),
      fetch('/api/admin/tasks'),
    ])
    const empData = await empRes.json()
    const taskData = await taskRes.json()
    setEmployees(empData.employees || [])
    setTasks(taskData.tasks || [])
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!form.title || !form.assigned_to) return
    setCreating(true)
    const res = await fetch('/api/admin/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setForm({ title: '', description: '', due_date: '', assigned_to: '' })
      setShowForm(false)
      fetchData()
    }
    setCreating(false)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Task Management</h1>
            <p className="text-muted-foreground">Assign and track tasks for your employees</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'New Task'}
          </Button>
        </div>

        {/* Create Task Form */}
        {showForm && (
          <Card className="p-6 mb-6">
            <h2 className="font-semibold mb-4">Create New Task</h2>
            <div className="space-y-4">
              <div>
                <Label>Task Title</Label>
                <Input
                  className="mt-1"
                  placeholder="e.g. Read the company handbook"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Input
                  className="mt-1"
                  placeholder="Add more details about this task"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Assign To</Label>
                <select
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={form.assigned_to}
                  onChange={e => setForm({ ...form, assigned_to: e.target.value })}
                >
                  <option value="">Select an employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Due Date (optional)</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={form.due_date}
                  onChange={e => setForm({ ...form, due_date: e.target.value })}
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={creating || !form.title || !form.assigned_to}
                className="w-full gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Task'}
              </Button>
            </div>
          </Card>
        )}

        {/* Tasks List */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">All Tasks ({tasks.length})</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Assigned to: {task.users?.name}
                      {task.due_date && ` · Due: ${new Date(task.due_date).toLocaleDateString()}`}
                    </p>
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
              <p>No tasks yet.</p>
              <p className="text-sm">Create your first task above.</p>
            </div>
          )}
        </Card>

      </div>
    </div>
  )
}