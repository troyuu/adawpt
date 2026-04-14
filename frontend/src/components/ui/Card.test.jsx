import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Card from './Card'

describe('Card', () => {
  it('renders children content', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders as a div by default', () => {
    const { container } = render(<Card>Content</Card>)
    expect(container.firstChild.tagName).toBe('DIV')
  })

  it('renders as a button when onClick is provided', () => {
    const handleClick = vi.fn()
    render(<Card onClick={handleClick}>Clickable</Card>)
    const card = screen.getByRole('button')
    expect(card.tagName).toBe('BUTTON')
  })

  it('fires onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(<Card onClick={handleClick}>Clickable</Card>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies cursor-pointer class when onClick is provided', () => {
    render(<Card onClick={() => {}}>Clickable</Card>)
    const card = screen.getByRole('button')
    expect(card.className).toContain('cursor-pointer')
  })

  it('applies hover shadow class when hoverable is true', () => {
    const { container } = render(<Card hoverable>Hoverable</Card>)
    expect(container.firstChild.className).toContain('hover:shadow-md')
  })

  it('does not apply hover shadow class by default', () => {
    const { container } = render(<Card>Static</Card>)
    expect(container.firstChild.className).not.toContain('hover:shadow-md')
  })

  it('always includes base card styles', () => {
    const { container } = render(<Card>Base</Card>)
    const card = container.firstChild
    expect(card.className).toContain('bg-white')
    expect(card.className).toContain('rounded-xl')
    expect(card.className).toContain('shadow-sm')
    expect(card.className).toContain('p-6')
  })

  it('merges custom className', () => {
    const { container } = render(<Card className="custom-card">Styled</Card>)
    expect(container.firstChild.className).toContain('custom-card')
  })

  it('passes additional props through', () => {
    const { container } = render(<Card data-testid="my-card">Test</Card>)
    expect(screen.getByTestId('my-card')).toBeInTheDocument()
  })
})
