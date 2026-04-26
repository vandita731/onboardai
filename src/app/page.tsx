import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users, ClipboardList, MessageSquare,
  BarChart3, ArrowRight, CheckCircle
} from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* Navbar */}
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">OnboardAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <Badge className="mb-4" variant="secondary">
          AI-Powered Onboarding
        </Badge>
        <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
          Onboard new hires <br />
          <span className="text-primary">smarter and faster</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
          Give your new employees a structured onboarding experience.
          Assign daily tasks, monitor progress, and let AI answer their
          questions using your company documents.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/sign-up">
            <Button size="lg" className="gap-2">
              Start for free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need to onboard well
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="p-6 flex flex-col gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why companies love OnboardAI
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div key={b} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="bg-primary rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to transform your onboarding?
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Set up your company in minutes. No credit card required.
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="secondary" className="gap-2">
              Get started for free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        © 2025 OnboardAI. Built with Next.js, Supabase & AI.
      </footer>

    </main>
  )
}

const features = [
  {
    icon: ClipboardList,
    title: 'Daily Tasks',
    description: 'Assign structured daily tasks to help new hires learn about your company step by step.',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Monitor every new hire\'s progress in real time from a clean manager dashboard.',
  },
  {
    icon: MessageSquare,
    title: 'AI Q&A',
    description: 'New hires ask questions, AI answers instantly using your uploaded company documents.',
  },
  {
    icon: Users,
    title: 'Role Based Access',
    description: 'Separate dashboards for admins, managers, and employees. Everyone sees what they need.',
  },
]

const benefits = [
  'Reduce time-to-productivity for new hires by giving them clear daily goals',
  'Managers spend less time answering repetitive questions thanks to AI',
  'HR gets full visibility into how each new hire is progressing',
  'New employees feel supported and less overwhelmed on day one',
  'Upload your existing handbooks and SOPs — AI learns from them instantly',
  'Multi-company support — perfect for HR agencies and enterprise teams',
]