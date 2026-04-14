import { clsx } from 'clsx'

export default function Textarea({ label, error, id, className, ...rest }) {
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={clsx(
          'w-full min-h-24 px-3 py-2 border rounded-lg text-sm outline-none transition-colors duration-150 resize-y',
          error
            ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
            : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
        )}
        {...rest}
      />
      {error && (
        <p className="mt-1 text-xs text-danger">{error}</p>
      )}
    </div>
  )
}
