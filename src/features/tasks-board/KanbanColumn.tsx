import { useState, type DragEvent } from 'react'
import type { AppTask, TaskStatus } from './types'
import { TaskCard } from './TaskCard'

interface KanbanColumnProps {
  status: TaskStatus
  label: string
  color: string
  tasks: AppTask[]
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void
  onTaskClick: (task: AppTask) => void
}

export function KanbanColumn({ status, label, color, tasks, onStatusChange, onTaskClick }: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  function handleDragLeave() {
    setIsDragOver(false)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      onStatusChange(Number(taskId), status)
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col rounded-xl border-t-4 p-4 shadow-xs min-h-[500px] transition-colors ${
        isDragOver ? 'ring-2 ring-blue-400 ring-offset-2' : ''
      } ${color}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">{label}</h2>
        <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-xs font-bold text-slate-600">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={onTaskClick}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300/70 bg-slate-50/50 py-10 text-center text-xs text-slate-400">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  )
}
