import { clsx } from 'clsx'

export default function Skeleton({ className, width, height }) {
  return (
    <div
      className={clsx('animate-pulse bg-gray-200 rounded', className)}
      style={{
        width: width ?? undefined,
        height: height ?? undefined,
      }}
      aria-hidden="true"
    />
  )
}
