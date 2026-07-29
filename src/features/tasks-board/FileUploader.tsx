import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'

interface FileUploaderProps {
  onUpload: (file: File) => void
}

interface StagedFile {
  name: string
  size: number
  type: string
}

export function FileUploader({ onUpload }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [staged, setStaged] = useState<StagedFile | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) stageFile(file)
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) stageFile(file)
    e.target.value = ''
  }

  function stageFile(file: File) {
    setStaged({ name: file.name, size: file.size, type: file.type })
  }

  function confirmUpload() {
    if (!staged) return
    const file = new File([''], staged.name, { type: staged.type })
    Object.defineProperty(file, 'size', { value: staged.size })
    onUpload(file)
    setStaged(null)
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".png,.jpg,.pdf,.doc,.docx,.xls,.xlsx,.zip"
          onChange={handleInputChange}
        />

        {!staged ? (
          <div className="text-sm text-slate-500">
            <span className="block text-lg mb-1">📎</span>
            <span className="font-medium text-slate-600">Drop a file here</span>
            <span className="block text-xs text-slate-400 mt-0.5">or click to browse (PNG, PDF, DOC, XLS)</span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-md bg-white p-2 shadow-xs">
            <div className="flex-1 truncate text-left text-sm">
              <p className="truncate font-medium text-slate-800">{staged.name}</p>
              <p className="text-xs text-slate-400">{formatSize(staged.size)}</p>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); confirmUpload() }}
                className="rounded px-2.5 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Upload
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setStaged(null) }}
                className="rounded px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-200 hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
