import { clsx } from 'clsx'

export default function Card({ children, className, hoverable = false, onClick, ...props }) {
  const Component = onClick ? 'button' : 'div'
  return (
    <Component
      className={clsx(
        'bg-white border border-gray-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] p-6 transition-all duration-200',
        hoverable && 'hover:shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] hover:-translate-y-0.5',
        onClick && 'cursor-pointer text-left w-full',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  )
}
