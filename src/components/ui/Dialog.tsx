'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onOpenChange(false)
      }}
    >
      <div
        className="w-full max-w-lg animate-in rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

function DialogHeader({ className, children, ...props }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)} {...props}>
      {children}
    </div>
  )
}

function DialogTitle({ className, children, ...props }: { className?: string; children: ReactNode }) {
  return (
    <h2 className={cn('text-lg font-semibold text-slate-900', className)} {...props}>
      {children}
    </h2>
  )
}

function DialogDescription({ className, children, ...props }: { className?: string; children: ReactNode }) {
  return (
    <p className={cn('text-sm text-slate-500', className)} {...props}>
      {children}
    </p>
  )
}

function DialogContent({ className, children, ...props }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  )
}

function DialogFooter({ className, children, ...props }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('flex items-center justify-end gap-3 p-6 pt-4', className)} {...props}>
      {children}
    </div>
  )
}

export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter }
