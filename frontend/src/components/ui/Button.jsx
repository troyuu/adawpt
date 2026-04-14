import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

export default function Button({
  children, variant = 'primary', size = 'md', disabled = false,
  loading = false, type = 'button', onClick, className, ...props
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white',
    secondary: 'bg-secondary hover:bg-secondary-hover text-white',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
    ghost: 'hover:bg-gray-100 text-gray-700',
    danger: 'bg-danger hover:bg-red-600 text-white',
  }
  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2',
  }
  return (
    <button type={type} className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading} onClick={onClick} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
