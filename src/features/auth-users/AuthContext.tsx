'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { api, setAuthToken, ApiError } from '../../../services/api'
import { supabase, supabaseConfigured } from '@/lib/supabase'
import type { AppUser, AuthState, LoginCredentials, SignUpData, ApiUsuario, SignUpResponse } from './types'
import { mapApiUserToAppUser } from './types'

const STORAGE_KEY = 'promanage_auth_token'

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUserProfile: (updates: Partial<AppUser>) => void
  getUsers: () => Promise<AppUser[]>
  updateUser: (userId: string, updates: Partial<AppUser>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function storeToken(token: string) {
  setAuthToken(token)
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, token)
  }
}

function loadStoredToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY)
  }
  return null
}

function clearToken() {
  setAuthToken(null)
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const stored = loadStoredToken()
    if (stored) setAuthToken(stored)
    return {
      user: null,
      isAuthenticated: false,
      isLoading: !!stored,
    }
  })

  useEffect(() => {
    const stored = loadStoredToken()
    if (!stored) return

    let cancelled = false
    api.get<ApiUsuario[]>('/usuarios/')
      .then((usuarios) => {
        if (cancelled) return
        const currentUser = usuarios.find(() => true)
        if (currentUser) {
          setState({ user: mapApiUserToAppUser(currentUser), isAuthenticated: true, isLoading: false })
        } else {
          clearToken()
          setState({ user: null, isAuthenticated: false, isLoading: false })
        }
      })
      .catch(() => {
        if (cancelled) return
        clearToken()
        setState({ user: null, isAuthenticated: false, isLoading: false })
      })

    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      const res = await api.post<{ access_token: string; user: { id: string; email: string } }>(
        '/auth/login/',
        credentials,
      )

      storeToken(res.access_token)
      const usuarios = await api.get<ApiUsuario[]>('/usuarios/')
      const currentUser = usuarios.find(() => true)
      const appUser = currentUser
        ? mapApiUserToAppUser(currentUser)
        : { id: res.user.id, email: res.user.email, name: res.user.email.split('@')[0], role: 'team_member' as const, hourlyRate: 0, department: '', createdAt: new Date().toISOString(), isActive: true }

      setState({ user: appUser, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (err) {
      const apiErr = err as ApiError
      const msg =
        apiErr.code === 'email_not_confirmed'
          ? 'Please confirm your email address before logging in. Check your inbox.'
          : apiErr.code === 'invalid_credentials'
            ? 'Invalid email or password.'
            : apiErr.message || 'Login failed. Please try again.'
      setState((prev) => ({ ...prev, isLoading: false }))
      return { success: false, error: msg }
    }
  }, [])

  const signUp = useCallback(async (data: SignUpData): Promise<{ success: boolean; error?: string }> => {
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      if (supabaseConfigured && supabase) {
        const { data: sbData, error: sbError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: { data: { full_name: data.name } },
        })

        if (sbError) {
          setState((prev) => ({ ...prev, isLoading: false }))
          return { success: false, error: sbError.message }
        }

        if (sbData.session?.access_token) {
          storeToken(sbData.session.access_token)
          const appUser: AppUser = {
            id: sbData.user!.id,
            email: data.email,
            name: data.name,
            role: 'team_member',
            hourlyRate: 0,
            department: '',
            createdAt: new Date().toISOString(),
            isActive: true,
          }
          setState({ user: appUser, isAuthenticated: true, isLoading: false })
          return { success: true }
        }

        setState((prev) => ({ ...prev, isLoading: false }))
        return {
          success: true,
          error: 'Account created! Please check your email to confirm your account before logging in.',
        }
      }

      const res = await api.post<SignUpResponse>('/auth/signup/', {
        email: data.email,
        password: data.password,
        nombre: data.name,
      })

      setState((prev) => ({ ...prev, isLoading: false }))

      if (res.confirmation_sent_at) {
        return {
          success: true,
          error: 'Account created! Please check your email to confirm your account before logging in.',
        }
      }

      return { success: true }
    } catch (err) {
      const apiErr = err as ApiError
      setState((prev) => ({ ...prev, isLoading: false }))
      return { success: false, error: apiErr.message || 'Sign up failed. Please try again.' }
    }
  }, [])

  const logout = useCallback(() => {
    clearToken()
    if (supabaseConfigured && supabase) {
      supabase.auth.signOut()
    }
    setState({ user: null, isAuthenticated: false, isLoading: false })
  }, [])

  const updateUserProfile = useCallback((updates: Partial<AppUser>) => {
    setState((prev) => {
      if (!prev.user) return prev
      return { ...prev, user: { ...prev.user, ...updates } }
    })
  }, [])

  const getUsers = useCallback(async (): Promise<AppUser[]> => {
    try {
      const apiUsers = await api.get<ApiUsuario[]>('/usuarios/')
      return apiUsers.map(mapApiUserToAppUser)
    } catch {
      return []
    }
  }, [])

  const updateUser = useCallback(async (userId: string, updates: Partial<AppUser>): Promise<void> => {
    try {
      const payload: Record<string, unknown> = {}
      if (updates.name) payload.nombre = updates.name
      if (updates.email) payload.email = updates.email
      if (updates.role) payload.rol = updates.role
      if (updates.hourlyRate !== undefined) payload.tarifa_hora = updates.hourlyRate.toString()
      if (updates.isActive !== undefined) payload.activo = updates.isActive

      await api.patch(`/usuarios/${userId}/`, payload)
    } catch (err) {
      console.error('Failed to update user:', err)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signUp,
        logout,
        updateUserProfile,
        getUsers,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
