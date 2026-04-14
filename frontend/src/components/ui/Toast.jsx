import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { clsx } from 'clsx'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

let toastId = 0

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const styles = {
  success: 'bg-success/10 border-success/30 text-green-800',
  error: 'bg-danger/10 border-danger/30 text-red-800',
  warning: 'bg-warning/10 border-warning/30 text-amber-800',
  info: 'bg-info/10 border-info/30 text-blue-800',
}

const iconColors = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-info',
}

function ToastItem({ toast, onRemove }) {
  const Icon = icons[toast.type] || icons.info

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, toast.duration || 4000)
    return () => clearTimeout(timer)
  }, [toast, onRemove])

  return (
    <div
      className={clsx(
        'flex items-start gap-3 px-4 py-3 border rounded-lg shadow-lg bg-white max-w-sm w-full pointer-events-auto animate-in slide-in-from-right fade-in duration-200',
        styles[toast.type]
      )}
      role="alert"
    >
      <Icon className={clsx('h-5 w-5 shrink-0 mt-0.5', iconColors[toast.type])} />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-0.5 rounded hover:bg-black/5 transition-colors shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type, duration }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
