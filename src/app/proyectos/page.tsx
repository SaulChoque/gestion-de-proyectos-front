'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/features/auth-users'
import { useProjects, SummaryCards, ProjectCRUDModal, FinancialChart } from '@/features/projects-dash'
import { STATUS_LABELS, STATUS_VARIANTS, type AppProject } from '@/features/projects-dash'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Avatar } from '@/components/ui/Avatar'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/Dialog'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function ProyectosPage() {
  const { user, logout } = useAuth()
  const { projects, isLoading, error, archiveProject, deleteProject, refreshProjects } = useProjects()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<AppProject | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [viewingProject, setViewingProject] = useState<AppProject | null>(null)

  const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'activo', label: 'Active' },
    { value: 'completado', label: 'Completed' },
    { value: 'en_espera', label: 'On Hold' },
    { value: 'archivado', label: 'Archived' },
  ]

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = !statusFilter || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [projects, search, statusFilter])

  const openEdit = (project: AppProject) => {
    setEditingProject(project)
    setModalOpen(true)
  }

  const openCreate = () => {
    setEditingProject(null)
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <h1 className="text-lg font-bold text-slate-800">ProManage</h1>
            <nav className="hidden items-center gap-1 md:flex">
              <Link href="/proyectos" className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800">Dashboard</Link>
              <Link href="/proyectos/reportes" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Reports</Link>
              <Link href="/usuarios" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Personnel</Link>
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
            <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <SummaryCards />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={refreshProjects}>Retry</Button>
          </div>
        )}

        <FinancialChart />

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Projects</h2>
              <p className="text-sm text-slate-500">{filtered.length} project{filtered.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-56">
                <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="w-40">
                <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
              </div>
              <Button onClick={openCreate}>+ New Project</Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <svg className="h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm text-slate-500">Loading projects...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <p>No projects found</p>
                        <Button variant="outline" size="sm" onClick={openCreate}>Create your first project</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <button className="text-left font-medium text-slate-800 hover:text-blue-600 cursor-pointer" onClick={() => setViewingProject(project)}>
                          {project.name}
                        </button>
                        <p className="text-xs text-slate-400">{project.description.slice(0, 50)}...</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[project.status]}>{STATUS_LABELS[project.status]}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(project.budget)}</TableCell>
                      <TableCell>{formatCurrency(project.actualSpent)}</TableCell>
                      <TableCell className="text-slate-600">{project.managerName || '—'}</TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {formatDate(project.startDate)}<br />{project.endDate ? formatDate(project.endDate) : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(project)}>Edit</Button>
                          {project.status !== 'archivado' && (
                            <Button variant="ghost" size="sm" onClick={() => archiveProject(project.id)}>Archive</Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setConfirmDelete(project.id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </main>

      <ProjectCRUDModal open={modalOpen} onOpenChange={setModalOpen} editProject={editingProject} />

      <Dialog open={!!viewingProject} onOpenChange={(open) => { if (!open) setViewingProject(null) }}>
        {viewingProject && (
          <>
            <DialogHeader>
              <DialogTitle>{viewingProject.name}</DialogTitle>
              <DialogDescription>{viewingProject.description}</DialogDescription>
            </DialogHeader>
            <DialogContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Status</p>
                  <Badge variant={STATUS_VARIANTS[viewingProject.status]}>{STATUS_LABELS[viewingProject.status]}</Badge>
                </div>
                <div>
                  <p className="text-slate-500">Manager</p>
                  <p className="font-medium">{viewingProject.managerName || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Budget</p>
                  <p className="font-medium">{formatCurrency(viewingProject.budget)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Actual Spent</p>
                  <p className="font-medium">{formatCurrency(viewingProject.actualSpent)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Start</p>
                  <p>{formatDate(viewingProject.startDate)}</p>
                </div>
                <div>
                  <p className="text-slate-500">End</p>
                  <p>{viewingProject.endDate ? formatDate(viewingProject.endDate) : '—'}</p>
                </div>
              </div>

              {viewingProject.phases.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">Phases</p>
                  <div className="space-y-2">
                    {viewingProject.phases.map((phase) => (
                      <div key={phase.id} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-medium text-slate-800">{phase.name}</p>
                          <p className="text-xs text-slate-500">{formatCurrency(phase.actualCost)} / {formatCurrency(phase.budgeted)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                            <div className={`h-full rounded-full ${phase.progress >= 80 ? 'bg-green-500' : phase.progress >= 40 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${phase.progress}%` }} />
                          </div>
                          <span className="text-xs text-slate-500">{phase.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DialogContent>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingProject(null)}>Close</Button>
              <Button onClick={() => { setViewingProject(null); openEdit(viewingProject) }}>Edit</Button>
            </DialogFooter>
          </>
        )}
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={(open) => { if (!open) setConfirmDelete(null) }}>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>Are you sure you want to delete this project? This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { if (confirmDelete) deleteProject(confirmDelete); setConfirmDelete(null) }}>Delete</Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
