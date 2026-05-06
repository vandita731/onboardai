import Sidebar from '@/components/shared/sidebar'

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role="employee" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}