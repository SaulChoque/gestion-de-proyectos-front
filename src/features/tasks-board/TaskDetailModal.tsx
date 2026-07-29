'use client'

import { useState, useEffect } from 'react'
import type { AppTask, AppComment, AppTimeEntry, AppAttachment, TaskStatus } from './types'
import { PRIORITY_STYLES } from './types'
import { CommentsSection } from './CommentsSection'
import { TimesheetLogger } from './TimesheetLogger'
import { FileUploader } from './FileUploader'

type Tab = 'details' | 'comments' | 'timesheet'

interface TaskDetailModalProps {
  task: AppTask
  comments: AppComment[]
  timeEntries: AppTimeEntry[]
  attachments: AppAttachment[]
  onClose: () => void
  onAddComment: (taskId: number, content: string) => void
  onAddTimeEntry: (taskId: number, hours: number, description: string) => void
  onUploadAttachment: (taskId: number, file: File) => void
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void
  onLoadComments?: () => Promise<AppComment[]>
}

export function TaskDetailModal({
  task,
  comments,
  timeEntries,
  attachments,
  onClose,
  onAddComment,
  onAddTimeEntry,
  onUploadAttachment,
  onStatusChange,
  onLoadComments,
}: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('details')

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    if (activeTab === 'comments' && onLoadComments) {
      onLoadComments()
    }
  }, [activeTab, task.id, onLoadComments])

  const taskComments = comments.filter((c) => c.taskId === task.id)
  const taskTimeEntries = timeEntries.filter((e) => e.taskId === task.id)
  const taskAttachments = attachments.filter((a) => a.taskId === task.id)

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'details', label: 'Details' },
    { id: 'comments', label: 'Comments', count: taskComments.length },
    { id: 'timesheet', label: 'Timesheet', count: taskTimeEntries.length },
  ]

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl max-h-[85vh]">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${PRIORITY_STYLES[task.priority]}`}>
                {task.priority}
              </span>
              <select
                value={task.status}
                onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="in-review">In Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <h2 className="text-lg font-bold text-slate-800 leading-snug">{task.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="ml-4 shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-slate-200 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {activeTab === 'details' && (
            <div className="space-y-5">
              <div>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Description</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{task.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Assignee</h4>
                  <p className="text-sm font-medium text-slate-700">{task.assignee || 'Unassigned'}</p>
                </div>
                <div>
                  <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Due Date</h4>
                  <p className="text-sm font-medium text-slate-700">{task.dueDate}</p>
                </div>
                <div>
                  <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Created</h4>
                  <p className="text-sm font-medium text-slate-700">{formatDate(task.createdAt)}</p>
                </div>
                <div>
                  <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Project</h4>
                  <p className="text-sm font-medium text-slate-700">{task.projectId}</p>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Attachments ({taskAttachments.length})
                </h4>
                {taskAttachments.length > 0 && (
                  <div className="mb-3 space-y-1.5">
                    {taskAttachments.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                        <span className="text-lg">📄</span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-slate-700">{a.name}</p>
                          <p className="text-[11px] text-slate-400">{formatSize(a.size)}</p>
                        </div>
                        <button
                          type="button"
                          className="rounded px-2 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                          onClick={() => alert(`Downloading ${a.name}...`)}
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <FileUploader onUpload={(file) => onUploadAttachment(task.id, file)} />
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="h-full flex flex-col" style={{ minHeight: '300px' }}>
              <CommentsSection
                comments={taskComments}
                onAddComment={(content) => onAddComment(task.id, content)}
              />
            </div>
          )}

          {activeTab === 'timesheet' && (
            <div className="h-full flex flex-col" style={{ minHeight: '300px' }}>
              <TimesheetLogger
                entries={taskTimeEntries}
                onAddEntry={(hours, desc) => onAddTimeEntry(task.id, hours, desc)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
