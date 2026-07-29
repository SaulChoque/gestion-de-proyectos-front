import type { AppTask } from './types'
import { PRIORITY_STYLES } from './types'
import { STATUS_LABELS } from './types'

interface TaskCardProps {
  task: AppTask
  onClick: (task: AppTask) => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(task.id))
        e.dataTransfer.effectAllowed = 'move'
      }}
      onClick={() => onClick(task)}
      className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98]"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
          {STATUS_LABELS[task.status]}
        </span>
      </div>

      <h3 className="mb-1 text-sm font-semibold leading-snug text-slate-800">
        {task.title}
      </h3>
      <p className="mb-3 line-clamp-2 text-xs text-slate-500">
        {task.description}
      </p>

      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-400">
        <span>{task.dueDate}</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-semibold text-indigo-700">
            {task.assignee.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        </span>
      </div>
    </div>
  )
}
