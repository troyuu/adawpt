import { clsx } from 'clsx'

export default function EmptyState({ title, description, icon: Icon, action, className }) {
  return (
    <div className={clsx('flex flex-col items-center justify-center text-center py-12 px-4', className)}>
      {Icon && (
        <div className="mb-4 rounded-full bg-gray-100 p-4">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 font-display">{title}</h3>
      )}
      {description && (
        <p className="mt-1 text-sm text-gray-500 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
