import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from './Badge'

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders as a span element', () => {
    render(<Badge>Status</Badge>)
    expect(screen.getByText('Status').tagName).toBe('SPAN')
  })

  describe('variants', () => {
    it('applies default variant styles when no variant is specified', () => {
      render(<Badge>Default</Badge>)
      const badge = screen.getByText('Default')
      expect(badge.className).toContain('bg-gray-100')
      expect(badge.className).toContain('text-gray-700')
    })

    it('applies success variant styles', () => {
      render(<Badge variant="success">Approved</Badge>)
      const badge = screen.getByText('Approved')
      expect(badge.className).toContain('text-success')
    })

    it('applies warning variant styles', () => {
      render(<Badge variant="warning">Pending</Badge>)
      const badge = screen.getByText('Pending')
      expect(badge.className).toContain('text-warning')
    })

    it('applies danger variant styles', () => {
      render(<Badge variant="danger">Rejected</Badge>)
      const badge = screen.getByText('Rejected')
      expect(badge.className).toContain('text-danger')
    })

    it('applies info variant styles', () => {
      render(<Badge variant="info">New</Badge>)
      const badge = screen.getByText('New')
      expect(badge.className).toContain('text-info')
    })

    it('applies primary variant styles', () => {
      render(<Badge variant="primary">Featured</Badge>)
      const badge = screen.getByText('Featured')
      expect(badge.className).toContain('text-primary')
    })
  })

  it('always includes base styles (rounded-full, text-xs, font-medium)', () => {
    render(<Badge>Test</Badge>)
    const badge = screen.getByText('Test')
    expect(badge.className).toContain('rounded-full')
    expect(badge.className).toContain('text-xs')
    expect(badge.className).toContain('font-medium')
  })

  it('merges custom className', () => {
    render(<Badge className="ml-2">Custom</Badge>)
    const badge = screen.getByText('Custom')
    expect(badge.className).toContain('ml-2')
  })
})
