export type ProjectStatus = 'activo' | 'archivado' | 'completado' | 'en_espera'

export interface ApiProyecto {
  id_proyecto: number
  nombre: string
  descripcion: string | null
  fecha_inicio: string
  fecha_fin: string | null
  presupuesto_total: string
  estado: string | null
  fecha_creacion: string | null
  id_gerente: string
}

export interface AppProject {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string | null
  status: ProjectStatus
  budget: number
  actualSpent: number
  phases: ProjectPhase[]
  managerId: string
  managerName: string
  createdAt: string
}

export interface ProjectPhase {
  id: string
  name: string
  budgeted: number
  actualCost: number
  progress: number
}

export interface FinancialSummary {
  totalBudget: number
  totalActualCost: number
  averageProgress: number
  projectCount: number
  activeProjectCount: number
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  activo: 'Active',
  archivado: 'Archived',
  completado: 'Completed',
  en_espera: 'On Hold',
}

export const STATUS_VARIANTS: Record<ProjectStatus, 'default' | 'secondary' | 'success' | 'warning'> = {
  activo: 'default',
  archivado: 'secondary',
  completado: 'success',
  en_espera: 'warning',
}

export const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export function mapApiProyectoToApp(api: ApiProyecto): AppProject {
  return {
    id: api.id_proyecto,
    name: api.nombre,
    description: api.descripcion ?? '',
    startDate: api.fecha_inicio,
    endDate: api.fecha_fin,
    status: mapStatus(api.estado),
    budget: parseFloat(api.presupuesto_total),
    actualSpent: 0,
    phases: [],
    managerId: api.id_gerente,
    managerName: '',
    createdAt: api.fecha_creacion ?? new Date().toISOString(),
  }
}

function mapStatus(estado: string | null): ProjectStatus {
  switch (estado?.toLowerCase()) {
    case 'activo': return 'activo'
    case 'archivado': return 'archivado'
    case 'completado': return 'completado'
    case 'en_espera': return 'en_espera'
    default: return 'activo'
  }
}

export function mapAppToApiProyecto(app: Partial<AppProject>): Record<string, unknown> {
  return {
    nombre: app.name,
    descripcion: app.description || '',
    fecha_inicio: app.startDate,
    fecha_fin: app.endDate || null,
    presupuesto_total: (app.budget ?? 0).toString(),
    estado: app.status || 'activo',
    id_gerente: app.managerId || '00000000-0000-0000-0000-000000000000',
  }
}
