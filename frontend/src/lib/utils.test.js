import { describe, it, expect } from 'vitest'
import { formatDate, formatCurrency, getInitials, truncate, classNames } from './utils'

describe('formatDate', () => {
  it('formats an ISO date string with default format', () => {
    expect(formatDate('2024-03-15')).toBe('Mar 15, 2024')
  })

  it('formats a Date object', () => {
    const date = new Date(2024, 0, 1) // January 1, 2024
    expect(formatDate(date)).toBe('Jan 1, 2024')
  })

  it('accepts a custom format string', () => {
    expect(formatDate('2024-12-25', 'yyyy/MM/dd')).toBe('2024/12/25')
  })

  it('returns empty string for null/undefined', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
    expect(formatDate('')).toBe('')
  })

  it('returns empty string for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('')
  })
})

describe('formatCurrency', () => {
  it('formats a number as USD currency', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('returns $0.00 for null', () => {
    expect(formatCurrency(null)).toBe('$0.00')
  })

  it('returns $0.00 for undefined', () => {
    expect(formatCurrency(undefined)).toBe('$0.00')
  })

  it('returns $0.00 for NaN', () => {
    expect(formatCurrency(NaN)).toBe('$0.00')
  })

  it('handles large numbers', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00')
  })

  it('handles negative numbers', () => {
    const result = formatCurrency(-50)
    expect(result).toContain('50.00')
  })
})

describe('getInitials', () => {
  it('returns initials for a two-word name', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('returns a single initial for a single name', () => {
    expect(getInitials('Alice')).toBe('A')
  })

  it('returns at most 2 characters', () => {
    expect(getInitials('John Michael Doe')).toBe('JM')
  })

  it('returns uppercase initials', () => {
    expect(getInitials('alice bob')).toBe('AB')
  })

  it('returns "?" for empty/null/undefined name', () => {
    expect(getInitials('')).toBe('?')
    expect(getInitials(null)).toBe('?')
    expect(getInitials(undefined)).toBe('?')
  })

  it('handles extra whitespace', () => {
    expect(getInitials('  John   Doe  ')).toBe('JD')
  })
})

describe('truncate', () => {
  it('returns the string unchanged if shorter than length', () => {
    expect(truncate('Hello', 10)).toBe('Hello')
  })

  it('returns the string unchanged if exactly at length', () => {
    expect(truncate('Hello', 5)).toBe('Hello')
  })

  it('truncates and adds ellipsis when exceeding length', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...')
  })

  it('uses default length of 100', () => {
    const longStr = 'a'.repeat(150)
    const result = truncate(longStr)
    expect(result.length).toBeLessThanOrEqual(103) // 100 chars + "..."
    expect(result).toContain('...')
  })

  it('returns empty string for null/undefined/empty', () => {
    expect(truncate(null)).toBe('')
    expect(truncate(undefined)).toBe('')
    expect(truncate('')).toBe('')
  })

  it('trims trailing whitespace before adding ellipsis', () => {
    expect(truncate('Hello World Test', 6)).toBe('Hello...')
  })
})

describe('classNames', () => {
  it('joins multiple string arguments', () => {
    expect(classNames('foo', 'bar', 'baz')).toBe('foo bar baz')
  })

  it('filters out falsy values', () => {
    expect(classNames('foo', null, undefined, false, '', 'bar')).toBe('foo bar')
  })

  it('handles arrays', () => {
    expect(classNames(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('returns empty string when given no truthy args', () => {
    expect(classNames(null, undefined, false)).toBe('')
  })

  it('returns empty string when called with no args', () => {
    expect(classNames()).toBe('')
  })
})
