'use client'

import { useState, useCallback, useEffect } from 'react'
import { api } from '../../../services/api'
import type { AppTask, AppComment, AppTimeEntry, AppAttachment, TaskStatus, ApiTarea, ApiComentario } from './types'
import { STATUSES, STATUS_LABELS, STATUS_COLORS, mapApiTareaToApp, mapAppStatusToDb } from './types'
import { initialTasks, initialTimeEntries, initialAttachments } from './mock-data'
import { KanbanColumn } from './KanbanColumn'
import { TaskDetailModal } from './TaskDetailModal'

export function KanbanBoard() {
  const [tasks, setTasks] = useState<AppTask[]>([])
  const [comments, setComments] = useState<AppComment[]>([])
  const [timeEntries, setTimeEntries] = useState<AppTimeEntry[]>(initialTimeEntries)
  const [attachments, setAttachments] = useState<AppAttachment[]>(initialAttachments)
  const [selectedTask, setSelectedTask] = useState<AppTask | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTasks() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await api.get<ApiTarea[]>('/tareas/')
        setTasks(data.map(mapApiTareaToApp))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load tasks'
        setError(message)
        setTasks(initialTasks as AppTask[])
      } finally {
        setIsLoading(false)
      }
    }
    loadTasks()
  }, [])

  const loadComments = useCallback(async (taskId: number): Promise<AppComment[]> => {
    try {
      const data = await api.get<ApiComentario[]>('/comentarios/')
      return data.filter((c) => c.id_tarea === taskId).map((c) => ({
        id: c.id_comentario,
        taskId: c.id_tarea,
        author: c.id_usuario,
        content: c.texto_comentario,
        createdAt: c.fecha_creacion ?? new Date().toISOString(),
      }))
    } catch {
      return comments.filter((c) => c.taskId === taskId)
    }
  }, [comments])

  const handleStatusChange = useCallback(async (taskId: number, newStatus: TaskStatus) => {
    const dbStatus = mapAppStatusToDb(newStatus)
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))
    try {
      await api.patch(`/tareas/${taskId}/`, { estado: dbStatus })
    } catch (err) {
      console.error('Failed to update task status:', err)
    }
  }, [])

  const handleAddComment = useCallback(async (taskId: number, content: string) => {
    const tempComment: AppComment = {
      id: Date.now(),
      taskId,
      author: 'You',
      content,
      createdAt: new Date().toISOString(),
    }
    setComments((prev) => [tempComment, ...prev])

    try {
      const created = await api.post<ApiComentario>('/comentarios/', {
        texto_comentario: content,
        id_tarea: taskId,
        id_usuario: '00000000-0000-0000-0000-000000000000',
      })
      setComments((prev) =>
        prev.map((c) =>
          c.id === tempComment.id
            ? { ...c, id: created.id_comentario, createdAt: created.fecha_creacion ?? c.createdAt }
            : c,
        ),
      )
    } catch (err) {
      console.error('Failed to post comment:', err)
    }
  }, [])

  const handleAddTimeEntry = useCallback((taskId: number, hours: number, description: string) => {
    const entry: AppTimeEntry = {
      id: `te-${Date.now()}`,
      taskId,
      hours,
      description,
      date: new Date().toISOString().slice(0, 10),
    }
    setTimeEntries((prev) => [...prev, entry])
  }, [])

  const handleUploadAttachment = useCallback((taskId: number, file: File) => {
    const attachment: AppAttachment = {
      id: `a-${Date.now()}`,
      taskId,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
    }
    setAttachments((prev) => [...prev, attachment])
  }, [])

  const columns = STATUSES.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    color: STATUS_COLORS[status],
    tasks: tasks.filter((t) => t.status === status),
  }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-slate-500">Loading tasks...</p>
        </div>
      </div>
    )
  }

  if (error && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            label={col.label}
            color={col.color}
            tasks={col.tasks}
            onStatusChange={handleStatusChange}
            onTaskClick={setSelectedTask}
          />
        ))}
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          comments={comments}
          timeEntries={timeEntries}
          attachments={attachments}
          onClose={() => setSelectedTask(null)}
          onAddComment={handleAddComment}
          onAddTimeEntry={(taskId, hours, desc) => handleAddTimeEntry(Number(taskId), hours, desc)}
          onUploadAttachment={(taskId, file) => handleUploadAttachment(Number(taskId), file)}
          onStatusChange={(taskId, newStatus) => {
            handleStatusChange(taskId, newStatus)
            setSelectedTask((prev) =>
              prev?.id === taskId ? { ...prev, status: newStatus as TaskStatus } : prev,
            )
          }}
          onLoadComments={() => loadComments(selectedTask.id)}
        />
      )}
    </>
  )
}
