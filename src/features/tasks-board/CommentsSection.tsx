import { useState } from 'react'
import type { AppComment } from './types'

interface CommentsSectionProps {
  comments: AppComment[]
  onAddComment: (content: string) => void
}

export function CommentsSection({ comments, onAddComment }: CommentsSectionProps) {
  const [input, setInput] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    onAddComment(trimmed)
    setInput('')
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
        {comments.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-8">No comments yet. Start the discussion.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700">{c.author}</span>
              <span className="text-[10px] text-slate-400">{formatDate(c.createdAt)}</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{c.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex items-end gap-2 border-t border-slate-200 pt-3">
        <div className="flex-1">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  )
}
