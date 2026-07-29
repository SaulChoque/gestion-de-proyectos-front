export type UserRole = 'admin' | 'project_manager' | 'team_member' | 'executive'

export interface AppUser {
  id: string
  email: string
  name: string
  role: UserRole
  hourlyRate: number
  department: string
  createdAt: string
  isActive: boolean
}

export interface AuthState {
  user: AppUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpData {
  name: string
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token?: string
  user: SupabaseUser
}

export interface SupabaseUser {
  id: string
  email: string
  app_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown>
}

export interface SignUpResponse {
  id: string
  email: string
  aud: string
  role: string
  confirmation_sent_at?: string
  created_at: string
  identities?: Array<{ id: string; provider: string }>
}

export interface ApiUsuario {
  id_usuario: string
  nombre: string
  email: string
  rol: string
  tarifa_hora: string
  activo: boolean | null
  fecha_creacion: string | null
}

export function mapApiUserToAppUser(api: ApiUsuario): AppUser {
  return {
    id: api.id_usuario,
    email: api.email,
    name: api.nombre,
    role: mapRol(api.rol),
    hourlyRate: parseFloat(api.tarifa_hora),
    department: 'General',
    createdAt: api.fecha_creacion ?? new Date().toISOString(),
    isActive: api.activo ?? true,
  }
}

function mapRol(rol: string): UserRole {
  switch (rol.toLowerCase()) {
    case 'admin': return 'admin'
    case 'project_manager': return 'project_manager'
    case 'team_member': return 'team_member'
    case 'executive': return 'executive'
    default: return 'team_member'
  }
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  project_manager: 'Project Manager',
  team_member: 'Team Member',
  executive: 'Executive',
}

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export const ROLE_COLORS: Record<UserRole, 'default' | 'secondary' | 'success' | 'warning'> = {
  admin: 'default',
  project_manager: 'success',
  team_member: 'secondary',
  executive: 'warning',
}
