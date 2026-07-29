'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { api } from '../../../services/api'
import type { AppProject, ApiProyecto } from './types'
import { mapApiProyectoToApp, mapAppToApiProyecto } from './types'

interface ProjectsContextValue {
  projects: AppProject[]
  isLoading: boolean
  error: string | null
  getProject: (id: number) => AppProject | undefined
  createProject: (data: { name: string; description: string; startDate: string; endDate: string; budget: number; managerId: string }) => Promise<void>
  updateProject: (id: number, updates: Partial<AppProject>) => Promise<void>
  archiveProject: (id: number) => Promise<void>
  deleteProject: (id: number) => Promise<void>
  refreshProjects: () => Promise<void>
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null)

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<AppProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshProjects = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.get<ApiProyecto[]>('/proyectos/')
      setProjects(data.map(mapApiProyectoToApp))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load projects'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    api.get<ApiProyecto[]>('/proyectos/')
      .then((data) => {
        if (!cancelled) {
          setProjects(data.map(mapApiProyectoToApp))
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load projects')
          setIsLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [])

  const getProject = useCallback(
    (id: number) => projects.find((p) => p.id === id),
    [projects],
  )

  const createProject = useCallback(async (data: { name: string; description: string; startDate: string; endDate: string; budget: number; managerId: string }) => {
    const payload = {
      nombre: data.name,
      descripcion: data.description,
      fecha_inicio: data.startDate,
      fecha_fin: data.endDate || null,
      presupuesto_total: data.budget.toString(),
      id_gerente: data.managerId,
    }
    const created = await api.post<ApiProyecto>('/proyectos/', payload)
    setProjects((prev) => [mapApiProyectoToApp(created), ...prev])
  }, [])

  const updateProject = useCallback(async (id: number, updates: Partial<AppProject>) => {
    const payload = mapAppToApiProyecto(updates)
    await api.patch<ApiProyecto>(`/proyectos/${id}/`, payload)
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    )
  }, [])

  const archiveProject = useCallback(async (id: number) => {
    await api.patch<ApiProyecto>(`/proyectos/${id}/`, { estado: 'archivado' })
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'archivado' as const } : p)),
    )
  }, [])

  const deleteProject = useCallback(async (id: number) => {
    await api.delete(`/proyectos/${id}/`)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return (
    <ProjectsContext.Provider
      value={{ projects, isLoading, error, getProject, createProject, updateProject, archiveProject, deleteProject, refreshProjects }}
    >
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects(): ProjectsContextValue {
  const ctx = useContext(ProjectsContext)
  if (!ctx) throw new Error('useProjects must be used within a ProjectsProvider')
  return ctx
}
