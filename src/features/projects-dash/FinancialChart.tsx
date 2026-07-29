'use client'

import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useProjects } from './ProjectsContext'
import { formatCurrency } from '@/lib/utils'

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

export function FinancialChart() {
  const { projects } = useProjects()

  const data = useMemo(() => {
    return projects
      .filter((p) => p.status === 'activo' || p.status === 'completado')
      .slice(0, 7)
      .map((p, i) => ({
        name: p.name.length > 18 ? p.name.slice(0, 16) + '...' : p.name,
        budgeted: p.budget,
        actual: p.actualSpent,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }))
  }, [projects])

  const maxValue = Math.max(...data.map((d) => Math.max(d.budgeted, d.actual)), 1)
  const chartHeight = 300
  const barAreaHeight = chartHeight - 40
  const scaleY = (val: number) => (val / maxValue) * barAreaHeight

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real Costs vs Budgeted Amount</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-slate-400">
            No project data available
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-blue-600" />
                <span className="text-slate-600">Budgeted</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-emerald-500" />
                <span className="text-slate-600">Actual Spent</span>
              </div>
            </div>

            <svg
              viewBox={`0 0 ${data.length * 120 + 60} ${chartHeight}`}
              className="w-full overflow-visible"
              preserveAspectRatio="xMidYMid meet"
            >
              {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                const y = barAreaHeight - scaleY(maxValue * frac) + 5
                return (
                  <g key={frac}>
                    <line x1={40} y1={y} x2={data.length * 120 + 50} y2={y} stroke="#e2e8f0" strokeWidth={1} />
                    <text x={35} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400">
                      {formatCurrency(maxValue * frac)}
                    </text>
                  </g>
                )
              })}

              {data.map((item, i) => {
                const x = 60 + i * 120
                const barWidth = 40
                const gap = 8
                const budgetHeight = scaleY(item.budgeted)
                const actualHeight = scaleY(item.actual)

                return (
                  <g key={i}>
                    <rect x={x} y={barAreaHeight - budgetHeight + 5} width={barWidth} height={budgetHeight} fill={item.color} rx={4} opacity={0.85} />
                    <rect x={x + barWidth + gap} y={barAreaHeight - actualHeight + 5} width={barWidth} height={actualHeight} fill="#10b981" rx={4} opacity={0.85} />
                    <text x={x + barWidth + gap / 2} y={barAreaHeight + 20} textAnchor="middle" className="text-[10px] fill-slate-500">{item.name}</text>
                    <text x={x + barWidth / 2} y={barAreaHeight - budgetHeight - 3 + 5} textAnchor="middle" className="text-[9px] fill-slate-500">
                      {item.budgeted >= 1000000 ? `$${(item.budgeted / 1000000).toFixed(1)}M` : item.budgeted >= 1000 ? `$${(item.budgeted / 1000).toFixed(0)}k` : formatCurrency(item.budgeted)}
                    </text>
                    <text x={x + barWidth + gap + barWidth / 2} y={barAreaHeight - actualHeight - 3 + 5} textAnchor="middle" className="text-[9px] fill-emerald-600">
                      {item.actual >= 1000000 ? `$${(item.actual / 1000000).toFixed(1)}M` : item.actual >= 1000 ? `$${(item.actual / 1000).toFixed(0)}k` : formatCurrency(item.actual)}
                    </text>
                  </g>
                )
              })}
            </svg>

            <div className="overflow-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-2.5 text-left font-medium text-slate-500 text-xs uppercase">Project</th>
                    <th className="px-4 py-2.5 text-right font-medium text-slate-500 text-xs uppercase">Budgeted</th>
                    <th className="px-4 py-2.5 text-right font-medium text-slate-500 text-xs uppercase">Actual</th>
                    <th className="px-4 py-2.5 text-right font-medium text-slate-500 text-xs uppercase">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, i) => {
                    const variance = item.budgeted - item.actual
                    const isOver = variance < 0
                    return (
                      <tr key={i} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-2.5 text-slate-800">{item.name}</td>
                        <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(item.budgeted)}</td>
                        <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(item.actual)}</td>
                        <td className={`px-4 py-2.5 text-right font-medium ${isOver ? 'text-red-600' : 'text-green-600'}`}>
                          {isOver ? '+' : ''}{formatCurrency(variance)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
