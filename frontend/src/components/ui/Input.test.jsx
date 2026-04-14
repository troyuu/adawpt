import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Input from './Input'

describe('Input', () => {
  it('renders without a label when label prop is not provided', () => {
    render(<Input id="email" placeholder="Enter email" />)
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
  })

  it('renders with a label when label prop is provided', () => {
    render(<Input id="email" label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('associates the label with the input via htmlFor and id', () => {
    render(<Input id="username" label="Username" />)
    const label = screen.getByText('Username')
    expect(label).toHaveAttribute('for', 'username')
    const input = screen.getByLabelText('Username')
    expect(input).toHaveAttribute('id', 'username')
  })

  it('shows an error message when error prop is provided', () => {
    render(<Input id="email" label="Email" error="Email is required" />)
    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })

  it('does not show an error message when error prop is absent', () => {
    render(<Input id="email" label="Email" />)
    expect(screen.queryByText(/required/i)).not.toBeInTheDocument()
  })

  it('applies error styling to the input when error is set', () => {
    render(<Input id="email" error="Invalid" />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('border-danger')
  })

  it('applies normal styling when there is no error', () => {
    render(<Input id="email" />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('border-gray-300')
  })

  it('forwards additional props to the input element', () => {
    render(<Input id="name" placeholder="Your name" type="text" disabled />)
    const input = screen.getByPlaceholderText('Your name')
    expect(input).toBeDisabled()
    expect(input).toHaveAttribute('type', 'text')
  })

  it('merges custom className on the wrapper div', () => {
    const { container } = render(<Input id="test" className="extra-class" />)
    const wrapper = container.firstChild
    expect(wrapper.className).toContain('extra-class')
  })
})
