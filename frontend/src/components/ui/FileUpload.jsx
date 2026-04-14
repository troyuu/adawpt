import { useState, useRef, useCallback } from 'react'
import { clsx } from 'clsx'
import { Upload, X, FileIcon } from 'lucide-react'

export default function FileUpload({
  onFilesSelected,
  maxFiles = 5,
  accept,
  label = 'Upload files',
  className,
}) {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFiles = useCallback(
    (incoming) => {
      const newFiles = Array.from(incoming)
      const updated = [...files, ...newFiles].slice(0, maxFiles)
      setFiles(updated)
      onFilesSelected?.(updated)
    },
    [files, maxFiles, onFilesSelected]
  )

  const removeFile = useCallback(
    (index) => {
      const updated = files.filter((_, i) => i !== index)
      setFiles(updated)
      onFilesSelected?.(updated)
    },
    [files, onFilesSelected]
  )

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const isImage = (file) => file.type.startsWith('image/')

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <p className="block text-sm font-medium text-gray-700 mb-1">{label}</p>
      )}

      {/* Drop zone */}
      <div
        className={clsx(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400'
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          Drag & drop files here, or <span className="text-primary font-medium">browse</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {accept ? `Accepted: ${accept}` : 'Any file type'} &middot; Max {maxFiles} file{maxFiles !== 1 ? 's' : ''}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {/* File previews */}
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, idx) => (
            <li
              key={`${file.name}-${idx}`}
              className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
            >
              {isImage(file) ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-10 w-10 rounded object-cover shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center shrink-0">
                  <FileIcon className="h-5 w-5 text-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(idx)
                }}
                className="p-1 rounded-md text-gray-400 hover:text-danger hover:bg-gray-100 transition-colors"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
