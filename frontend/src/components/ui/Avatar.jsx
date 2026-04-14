import { useState } from 'react'
import { clsx } from 'clsx'

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function Avatar({ src, alt, name, size = 'md', className }) {
  const [imgError, setImgError] = useState(false)

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  }

  const showImage = src && !imgError

  return (
    <div
      className={clsx(
        'relative inline-flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium shrink-0',
        sizes[size],
        className
      )}
      role="img"
      aria-label={alt || name || 'Avatar'}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="h-full w-full rounded-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  )
}
