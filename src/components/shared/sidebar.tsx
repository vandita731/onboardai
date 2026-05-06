'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import {
  LayoutDashboard, ClipboardList, FileText,
  MessageSquare, Users
} from 'lucide-react'

type SidebarProps = {
  role: 'admin' | 'employee'
}

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/admin/documents', label: 'Documents', icon: FileText },
]

const employeeLinks = [
  { href: '/employee', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employee/ask', label: 'Ask AI', icon: MessageSquare },
]

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const links = role === 'admin' ? adminLinks : employeeLinks

  return (
    <div className="w-64 min-h-screen bg-card border-r flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">OnboardAI</span>
        </div>
      </div>

      {/* Links */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t flex items-center gap-3">
        <UserButton />
        <span className="text-sm text-muted-foreground capitalize">{role}</span>
      </div>

    </div>
  )
}