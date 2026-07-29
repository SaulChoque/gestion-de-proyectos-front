'use client'

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { useProjects } from './ProjectsContext'
import { STATUS_LABELS, STATUS_VARIANTS } from './types'
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils'

type ExportView = 'all' | 'active' | 'completed' | 'budget-summary'

export function ReportingZone() {
  const { projects } = useProjects()
  const [view, setView] = useState<ExportView>('all')

  const filtered = useMemo(() => {
    switch (view) {
      case 'active':
        return projects.filter((p) => p.status === 'activo')
      case 'completed':
        return projects.filter((p) => p.status === 'completado')
      case 'budget-summary':
        return projects
      default:
        return projects
    }
  }, [projects, view])

  const viewOptions = [
    { value: 'all', label: 'All Projects' },
    { value: 'active', label: 'Active Projects' },
    { value: 'completed', label: 'Completed Projects' },
    { value: 'budget-summary', label: 'Budget Summary' },
  ]

  const handlePrint = () => window.print()

  const handleExportCSV = () => {
    const headers = ['Name', 'Status', 'Budget', 'Actual Spent', 'Manager', 'Start Date', 'End Date']
    const rows = filtered.map((p) => [
      p.name,
      STATUS_LABELS[p.status],
      p.budget.toString(),
      p.actualSpent.toString(),
      p.managerName,
      formatDate(p.startDate),
      p.endDate ? formatDate(p.endDate) : '',
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `projects-report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (view === 'budget-summary') {
    const totalBudget = filtered.reduce((s, p) => s + p.budget, 0)
    const totalActual = filtered.reduce((s, p) => s + p.actualSpent, 0)

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Budget Summary Report</CardTitle>
              <CardDescription>Overall budget consumption across all projects</CardDescription>
            </div>
            <div className="flex gap-2 print:hidden">
              <Select options={viewOptions} value={view} onChange={(e) => setView(e.target.value as ExportView)} />
              <Button variant="outline" size="sm" onClick={handlePrint}>Print</Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>Export CSV</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Total Budget</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalBudget)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Total Spent</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalActual)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Remaining</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalBudget - totalActual)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Consumption Rate</p>
              <p className="text-xl font-bold text-slate-900">
                {totalBudget > 0 ? formatPercent(Math.round((totalActual / totalBudget) * 100)) : '0%'}
              </p>
            </div>
          </div>
          <div className="overflow-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2.5 text-left font-medium text-slate-500 text-xs uppercase">Project</th>
                  <th className="px-4 py-2.5 text-right font-medium text-slate-500 text-xs uppercase">Budget</th>
                  <th className="px-4 py-2.5 text-right font-medium text-slate-500 text-xs uppercase">Actual</th>
                  <th className="px-4 py-2.5 text-right font-medium text-slate-500 text-xs uppercase">Variance</th>
                  <th className="px-4 py-2.5 text-right font-medium text-slate-500 text-xs uppercase">% Used</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const usedPct = p.budget > 0 ? Math.round((p.actualSpent / p.budget) * 100) : 0
                  const variance = p.budget - p.actualSpent
                  return (
                    <tr key={p.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-2.5 text-slate-800">{p.name}</td>
                      <td className="px-4 py-2.5 text-right">{formatCurrency(p.budget)}</td>
                      <td className="px-4 py-2.5 text-right">{formatCurrency(p.actualSpent)}</td>
                      <td className={`px-4 py-2.5 text-right font-medium ${variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(variance)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={usedPct > 100 ? 'text-red-600 font-medium' : ''}>{formatPercent(usedPct)}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Project Reports</CardTitle>
            <CardDescription>
              {view === 'all' ? 'Complete project listing' : view === 'active' ? 'Active projects overview' : 'Completed projects'}
            </CardDescription>
          </div>
          <div className="flex gap-2 print:hidden">
            <Select options={viewOptions} value={view} onChange={(e) => setView(e.target.value as ExportView)} />
            <Button variant="outline" size="sm" onClick={handlePrint}>Print</Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>Export CSV</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-2.5 text-left font-medium text-slate-500 text-xs uppercase">Project</th>
                <th className="px-4 py-2.5 text-left font-medium text-slate-500 text-xs uppercase">Status</th>
                <th className="px-4 py-2.5 text-right font-medium text-slate-500 text-xs uppercase">Budget</th>
                <th className="px-4 py-2.5 text-right font-medium text-slate-500 text-xs uppercase">Spent</th>
                <th className="px-4 py-2.5 text-left font-medium text-slate-500 text-xs uppercase">Manager</th>
                <th className="px-4 py-2.5 text-left font-medium text-slate-500 text-xs uppercase">Timeline</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">No projects match the selected filter</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.description.slice(0, 60)}...</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={STATUS_VARIANTS[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(p.budget)}</td>
                    <td className="px-4 py-2.5 text-right">{formatCurrency(p.actualSpent)}</td>
                    <td className="px-4 py-2.5 text-slate-600">{p.managerName || '—'}</td>
                    <td className="px-4 py-2.5">
                      <p className="text-xs text-slate-600">{formatDate(p.startDate)}</p>
                      <p className="text-xs text-slate-400">to {p.endDate ? formatDate(p.endDate) : '—'}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
