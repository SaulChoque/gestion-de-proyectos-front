import { useState } from 'react'
import type { AppTimeEntry } from './types'

interface TimesheetLoggerProps {
  entries: AppTimeEntry[]
  onAddEntry: (hours: number, description: string) => void
}

export function TimesheetLogger({ entries, onAddEntry }: TimesheetLoggerProps) {
  const [hours, setHours] = useState('')
  const [description, setDescription] = useState('')

  const total = entries.reduce((sum, e) => sum + e.hours, 0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const h = parseFloat(hours)
    const desc = description.trim()
    if (isNaN(h) || h <= 0 || !desc) return
    onAddEntry(h, desc)
    setHours('')
    setDescription('')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3 flex items-center justify-between rounded-lg bg-indigo-50 border border-indigo-200 px-4 py-2.5">
        <span className="text-sm font-medium text-indigo-700">Total logged</span>
        <span className="text-lg font-bold text-indigo-800">{total.toFixed(1)}h</span>
      </div>

      <form onSubmit={handleSubmit} className="mb-4 space-y-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-[11px] font-medium text-slate-500">Hours</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="e.g. 2.5"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
          </div>
          <div className="flex-[2]">
            <label className="mb-1 block text-[11px] font-medium text-slate-500">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you work on?"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={!hours || !description.trim()}
            className="mt-5 rounded-md bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            Log
          </button>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {entries.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-6">No time entries yet.</p>
        )}
        {entries.map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-md border border-slate-100 bg-white px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-slate-700">{e.description}</p>
              <p className="text-[11px] text-slate-400">{e.date}</p>
            </div>
            <span className="ml-3 shrink-0 rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
              {e.hours}h
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
