import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from './Button'

describe('Button', () => {
  it('renders with text content', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('defaults to type="button"', () => {
    render(<Button>Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('accepts type="submit"', () => {
    render(<Button type="submit">Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  describe('variants', () => {
    it('renders with primary variant by default', () => {
      render(<Button>Primary</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('bg-primary')
    })

    it('renders with outline variant', () => {
      render(<Button variant="outline">Outline</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('border')
      expect(btn.className).toContain('text-gray-700')
    })

    it('renders with danger variant', () => {
      render(<Button variant="danger">Delete</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('bg-danger')
    })

    it('renders with secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('bg-secondary')
    })

    it('renders with ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('text-gray-700')
    })
  })

  describe('sizes', () => {
    it('renders medium size by default', () => {
      render(<Button>Medium</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('h-10')
    })

    it('renders small size', () => {
      render(<Button size="sm">Small</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('h-8')
    })

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('h-12')
    })
  })

  describe('loading state', () => {
    it('shows a loading spinner when loading is true', () => {
      render(<Button loading>Loading</Button>)
      const btn = screen.getByRole('button')
      // The Loader2 icon renders an SVG with the animate-spin class
      const spinner = btn.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('disables the button when loading is true', () => {
      render(<Button loading>Loading</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('still renders children alongside the spinner', () => {
      render(<Button loading>Saving</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Saving')
    })
  })

  describe('disabled state', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('does not fire onClick when disabled', () => {
      const handleClick = vi.fn()
      render(<Button disabled onClick={handleClick}>Disabled</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('onClick', () => {
    it('fires onClick handler when clicked', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  it('merges custom className', () => {
    render(<Button className="my-custom-class">Custom</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('my-custom-class')
  })

  it('passes additional props to the button element', () => {
    render(<Button data-testid="custom-btn">Props</Button>)
    expect(screen.getByTestId('custom-btn')).toBeInTheDocument()
  })
})
