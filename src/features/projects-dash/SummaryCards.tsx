'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { useProjects } from './ProjectsContext'
import { formatCurrency, formatPercent } from '@/lib/utils'

export function SummaryCards() {
  const { projects } = useProjects()

  const summary = useMemo(() => {
    const active = projects.filter((p) => p.status === 'activo')
    const totalBudget = projects.reduce((s, p) => s + p.budget, 0)
    const totalActual = projects.reduce((s, p) => s + p.actualSpent, 0)
    const avgProgress = projects.length > 0
      ? Math.round(projects.reduce((s, p) => {
          const phaseProgress = p.phases.length > 0
            ? p.phases.reduce((sp, ph) => sp + ph.progress, 0) / p.phases.length
            : 0
          return s + phaseProgress
        }, 0) / projects.length)
      : 0

    return { totalBudget, totalActualCost: totalActual, averageProgress: avgProgress, projectCount: projects.length, activeProjectCount: active.length }
  }, [projects])

  const cards = [
    {
      title: 'Total Projects',
      value: summary.projectCount.toString(),
      sub: `${summary.activeProjectCount} active`,
      icon: (
        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      color: 'bg-blue-50',
    },
    {
      title: 'Average Progress',
      value: formatPercent(summary.averageProgress),
      sub: 'across all projects',
      icon: (
        <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'bg-emerald-50',
    },
    {
      title: 'Total Budget',
      value: formatCurrency(summary.totalBudget),
      sub: `${formatCurrency(summary.totalBudget - summary.totalActualCost)} remaining`,
      icon: (
        <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-violet-50',
    },
    {
      title: 'Actual Spent',
      value: formatCurrency(summary.totalActualCost),
      sub: `${summary.totalBudget > 0 ? formatPercent(Math.round((summary.totalActualCost / summary.totalBudget) * 100)) : '0%'} of budget used`,
      icon: (
        <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'bg-amber-50',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="mt-1 text-xs text-slate-400">{card.sub}</p>
              </div>
              <div className={`rounded-lg ${card.color} p-2.5`}>{card.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
