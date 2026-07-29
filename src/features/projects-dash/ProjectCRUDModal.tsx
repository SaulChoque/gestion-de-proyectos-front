'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/Dialog'
import { useProjects } from './ProjectsContext'
import { STATUS_OPTIONS, type AppProject, type ProjectStatus } from './types'

interface ProjectFormData {
  name: string
  description: string
  startDate: string
  endDate: string
  status: ProjectStatus
  budget: number
  managerId: string
  managerName: string
}

interface ProjectCRUDModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editProject?: AppProject | null
}

function ProjectForm({ editProject, close }: { editProject?: AppProject | null; close: () => void }) {
  const { createProject, updateProject } = useProjects()
  const [form, setForm] = useState<ProjectFormData>(() => {
    if (editProject) {
      return {
        name: editProject.name,
        description: editProject.description,
        startDate: editProject.startDate,
        endDate: editProject.endDate ?? '',
        status: editProject.status,
        budget: editProject.budget,
        managerId: editProject.managerId,
        managerName: editProject.managerName,
      }
    }
    return { name: '', description: '', startDate: '', endDate: '', status: 'activo' as ProjectStatus, budget: 0, managerId: '', managerName: '' }
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (editProject) {
      await updateProject(editProject.id, {
        name: form.name,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate || null,
        status: form.status,
        budget: form.budget,
        managerName: form.managerName,
      })
    } else {
      await createProject({
        name: form.name,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate,
        budget: Number(form.budget),
        managerId: form.managerId || '00000000-0000-0000-0000-000000000000',
      })
    }

    close()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editProject ? 'Edit Project' : 'New Project'}</DialogTitle>
        <DialogDescription>
          {editProject ? 'Update project details and budget' : 'Create a new project'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-4">
          <Input label="Project name" placeholder="e.g. ERP Migration" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea className="flex min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" placeholder="Brief description of the project" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Start date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            <Input label="End date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Budget ($)" type="number" min="0" step="1000" placeholder="e.g. 500000" value={form.budget || ''} onChange={(e) => setForm({ ...form, budget: parseFloat(e.target.value) || 0 })} required />
            <Input label="Manager name" placeholder="Full name" value={form.managerName} onChange={(e) => setForm({ ...form, managerName: e.target.value })} />
          </div>

          {editProject && (
            <Select label="Status" options={STATUS_OPTIONS} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })} />
          )}
        </DialogContent>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>Cancel</Button>
          <Button type="submit">{editProject ? 'Save changes' : 'Create project'}</Button>
        </DialogFooter>
      </form>
    </>
  )
}

export function ProjectCRUDModal({ open, onOpenChange, editProject }: ProjectCRUDModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ProjectForm key={editProject?.id ?? 'new'} editProject={editProject} close={() => onOpenChange(false)} />
    </Dialog>
  )
}
