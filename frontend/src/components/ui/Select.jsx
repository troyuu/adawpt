import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'

export default function Select({ label, error, options = [], placeholder, id, className, ...rest }) {
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={clsx(
            'w-full h-10 px-3 pr-10 border rounded-lg text-sm outline-none appearance-none transition-colors duration-150 bg-white',
            error
              ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
              : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <p className="mt-1 text-xs text-danger">{error}</p>
      )}
    </div>
  )
}
