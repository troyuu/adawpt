import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

export default function Spinner({ size = 'md', className }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div role="status" className={clsx('inline-flex', className)}>
      <Loader2 className={clsx('animate-spin text-primary', sizes[size])} />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
