import { format, parseISO, isValid } from 'date-fns'

/**
 * Format a date string or Date object into a readable format.
 * @param {string|Date} date
 * @param {string} formatStr - date-fns format string (default: 'MMM d, yyyy')
 * @returns {string}
 */
export function formatDate(date, formatStr = 'MMM d, yyyy') {
  if (!date) return ''
  const parsed = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(parsed)) return ''
  return format(parsed, formatStr)
}

/**
 * Format a date string for short display (e.g., "Apr 13, 2026").
 */
export function formatShortDate(dateStr) {
  if (!dateStr) return '--'
  const d = new Date(dateStr)
  if (isNaN(d)) return '--'
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Format a date string for long display (e.g., "Sunday, April 13, 2026").
 */
export function formatLongDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  return d.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * Format a time string (e.g., "3:30 PM").
 */
export function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  return d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true })
}

/**
 * Format an amount as currency (USD).
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Get uppercase initials from a full name.
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Truncate a string to a given length, appending ellipsis.
 * @param {string} str
 * @param {number} length
 * @returns {string}
 */
export function truncate(str, length = 100) {
  if (!str) return ''
  if (str.length <= length) return str
  return str.slice(0, length).trimEnd() + '...'
}

/**
 * Conditionally join class names (truthy values only).
 * @param  {...any} args - strings, objects, or arrays
 * @returns {string}
 */
export function classNames(...args) {
  return args
    .flat()
    .filter(Boolean)
    .join(' ')
}
