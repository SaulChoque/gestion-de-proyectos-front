export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface ApiTarea {
  id_tarea: number
  titulo: string
  descripcion: string | null
  fecha_inicio: string
  fecha_vencimiento: string
  prioridad: string
  estado: string | null
  horas_estimadas: string | null
  fecha_creacion: string | null
  id_proyecto: number
  id_tarea_padre: number | null
  tarea_predecesora: number | null
}

export interface ApiComentario {
  id_comentario: number
  texto_comentario: string
  fecha_creacion: string | null
  id_tarea: number
  id_usuario: string
}

export interface AppTask {
  id: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee: string
  createdAt: string
  dueDate: string
  projectId: number
  estimatedHours: number | null
}

export interface AppComment {
  id: number
  taskId: number
  author: string
  content: string
  createdAt: string
}

export interface AppTimeEntry {
  id: string
  taskId: number
  hours: number
  description: string
  date: string
}

export interface AppAttachment {
  id: string
  taskId: number
  name: string
  size: number
  type: string
  uploadedAt: string
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  'completed': 'Completed',
}

export const STATUS_COLORS: Record<TaskStatus, string> = {
  'todo': 'border-t-slate-400 bg-slate-50/80',
  'in-progress': 'border-t-blue-500 bg-blue-50/30',
  'in-review': 'border-t-amber-500 bg-amber-50/30',
  'completed': 'border-t-emerald-500 bg-emerald-50/30',
}

export const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-red-50 text-red-700 border-red-200',
}

export const STATUSES: TaskStatus[] = ['todo', 'in-progress', 'in-review', 'completed']

const STATUS_MAP_TO_DB: Record<TaskStatus, string> = {
  'todo': 'pendiente',
  'in-progress': 'en_progreso',
  'in-review': 'en_revision',
  'completed': 'completada',
}

const STATUS_MAP_FROM_DB: Record<string, TaskStatus> = {
  'pendiente': 'todo',
  'en_progreso': 'in-progress',
  'en_revision': 'in-review',
  'completada': 'completed',
}

const PRIORITY_MAP_TO_DB: Record<TaskPriority, string> = {
  low: 'baja',
  medium: 'media',
  high: 'alta',
}

const PRIORITY_MAP_FROM_DB: Record<string, TaskPriority> = {
  'baja': 'low',
  'media': 'medium',
  'alta': 'high',
}

export function mapApiTareaToApp(tarea: ApiTarea): AppTask {
  return {
    id: tarea.id_tarea,
    title: tarea.titulo,
    description: tarea.descripcion ?? '',
    status: STATUS_MAP_FROM_DB[tarea.estado ?? 'pendiente'] ?? 'todo',
    priority: PRIORITY_MAP_FROM_DB[tarea.prioridad.toLowerCase()] ?? 'medium',
    assignee: '',
    createdAt: tarea.fecha_creacion ?? new Date().toISOString(),
    dueDate: tarea.fecha_vencimiento,
    projectId: tarea.id_proyecto,
    estimatedHours: tarea.horas_estimadas ? parseFloat(tarea.horas_estimadas) : null,
  }
}

export function mapAppToApiTarea(task: Partial<AppTask>): Record<string, unknown> {
  return {
    titulo: task.title,
    descripcion: task.description || '',
    fecha_inicio: task.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
    fecha_vencimiento: task.dueDate || new Date().toISOString().split('T')[0],
    prioridad: PRIORITY_MAP_TO_DB[task.priority ?? 'medium'],
    estado: STATUS_MAP_TO_DB[task.status ?? 'todo'],
    id_proyecto: task.projectId ?? 0,
  }
}

export function mapAppStatusToDb(status: TaskStatus): string {
  return STATUS_MAP_TO_DB[status] ?? 'pendiente'
}
