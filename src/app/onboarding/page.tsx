'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Building2, ArrowRight, Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [step, setStep] = useState<'role' | 'details'>('role')
  const [role, setRole] = useState<'admin' | 'employee' | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRoleSelect = (selected: 'admin' | 'employee') => {
    setRole(selected)
    setStep('details')
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          companyName: role === 'admin' ? companyName : undefined,
          inviteCode: role === 'employee' ? inviteCode : undefined,
          clerkId: user?.id,
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        setLoading(false)
        return
      }

      if (role === 'admin') router.push('/admin')
      else router.push('/employee')

    } catch (e) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to OnboardAI</h1>
          <p className="text-muted-foreground mt-1">Let's get you set up in 30 seconds</p>
        </div>

        {/* Step 1 — Pick Role */}
        {step === 'role' && (
          <div className="grid grid-cols-1 gap-4">
            <button onClick={() => handleRoleSelect('admin')}>
              <Card className="p-6 text-left hover:border-primary transition-colors cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">I'm setting up my company</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a workspace, invite employees, and manage onboarding
                    </p>
                  </div>
                </div>
              </Card>
            </button>

            <button onClick={() => handleRoleSelect('employee')}>
              <Card className="p-6 text-left hover:border-primary transition-colors cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">I'm a new employee</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Join your company's workspace using an invite code
                    </p>
                  </div>
                </div>
              </Card>
            </button>
          </div>
        )}

        {/* Step 2 — Details */}
        {step === 'details' && (
          <Card className="p-6">
            {role === 'admin' ? (
              <div className="space-y-4">
                <div>
                  <Label>Company Name</Label>
                  <Input
                    className="mt-1"
                    placeholder="e.g. Acme Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Invite Code</Label>
                  <Input
                    className="mt-1"
                    placeholder="Enter your invite code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ask your manager for the invite code
                  </p>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive mt-3">{error}</p>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setStep('role')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || (role === 'admin' ? !companyName : !inviteCode)}
                className="flex-1 gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Continue <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </Card>
        )}

      </div>
    </div>
  )
}