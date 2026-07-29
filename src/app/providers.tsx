'use client'

import { type ReactNode } from 'react'
import { AuthProvider } from '@/features/auth-users'
import { ProjectsProvider } from '@/features/projects-dash'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProjectsProvider>
        {children}
      </ProjectsProvider>
    </AuthProvider>
  )
}
