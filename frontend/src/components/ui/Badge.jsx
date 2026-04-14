import { clsx } from 'clsx'

export default function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-info/10 text-info',
    primary: 'bg-primary/10 text-primary',
  }

  return (
    <span
      className={clsx(
        'px-2.5 py-0.5 text-xs font-medium rounded-full inline-flex items-center',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
