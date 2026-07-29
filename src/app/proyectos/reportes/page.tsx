'use client'

import Link from 'next/link'
import { useAuth } from '@/features/auth-users'
import { ReportingZone } from '@/features/projects-dash'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'

export default function ReportesPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <h1 className="text-lg font-bold text-slate-800">ProManage</h1>
            <nav className="hidden items-center gap-1 md:flex">
              <Link
                href="/proyectos"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <Link
                href="/proyectos/reportes"
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800"
              >
                Reports
              </Link>
              <Link
                href="/usuarios"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Personnel
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right text-sm">
                  <p className="font-medium text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <Avatar name={user.name} size="sm" />
              </div>
            )}
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <ReportingZone />
      </main>
    </div>
  )
}
