import { clsx } from 'clsx'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const config = {
  success: {
    icon: CheckCircle,
    bg: 'bg-success/10 border-success/20',
    iconColor: 'text-success',
    titleColor: 'text-green-800',
    textColor: 'text-green-700',
  },
  error: {
    icon: XCircle,
    bg: 'bg-danger/10 border-danger/20',
    iconColor: 'text-danger',
    titleColor: 'text-red-800',
    textColor: 'text-red-700',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-warning/10 border-warning/20',
    iconColor: 'text-warning',
    titleColor: 'text-amber-800',
    textColor: 'text-amber-700',
  },
  info: {
    icon: Info,
    bg: 'bg-info/10 border-info/20',
    iconColor: 'text-info',
    titleColor: 'text-blue-800',
    textColor: 'text-blue-700',
  },
}

export default function Alert({ children, variant = 'info', title, onClose, className }) {
  const { icon: Icon, bg, iconColor, titleColor, textColor } = config[variant]

  return (
    <div
      className={clsx('flex gap-3 p-4 border rounded-lg', bg, className)}
      role="alert"
    >
      <Icon className={clsx('h-5 w-5 shrink-0 mt-0.5', iconColor)} />
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className={clsx('text-sm font-semibold', titleColor)}>{title}</h3>
        )}
        <div className={clsx('text-sm', textColor, title && 'mt-1')}>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={clsx('p-1 rounded-md shrink-0 transition-colors hover:bg-black/5', textColor)}
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
