'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/features/auth-users'

export default function LoginPage() {
  const router = useRouter()
  const { login, signUp, isLoading } = useAuth()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setName('')
    setError('')
  }

  const switchMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'))
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'login') {
      const result = await login({ email, password })
      if (result.success) {
        router.push('/proyectos')
      } else {
        setError(result.error ?? 'Login failed')
      }
    } else {
      const result = await signUp({ name, email, password })
      if (result.success) {
        router.push('/proyectos')
      } else {
        setError(result.error ?? 'Sign up failed')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
            P
          </div>
          <CardTitle>{mode === 'login' ? 'Welcome back' : 'Create account'}</CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Enter your credentials to access the dashboard'
              : 'Register to start managing your projects'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            {mode === 'signup' && (
              <Input
                label="Full name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {mode === 'login' && (
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                <p className="mb-1 font-medium">Demo credentials:</p>
                <p>Admin: admin@promanage.com / admin123</p>
                <p>PM: project.manager@promanage.com / pm123</p>
                <p>Member: dev1@promanage.com / dev123</p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" loading={isLoading}>
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>

            <p className="text-center text-sm text-slate-500">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button type="button" onClick={switchMode} className="font-medium text-blue-600 hover:underline cursor-pointer">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={switchMode} className="font-medium text-blue-600 hover:underline cursor-pointer">
                    Sign in
                  </button>
                </>
              )}
            </p>

            <Link href="/" className="text-center text-xs text-slate-400 hover:text-slate-600 underline">
              Back to home
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
