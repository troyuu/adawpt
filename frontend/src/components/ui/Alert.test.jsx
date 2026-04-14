import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Alert from './Alert'

describe('Alert', () => {
  it('renders children as the alert message', () => {
    render(<Alert>Something happened</Alert>)
    expect(screen.getByText('Something happened')).toBeInTheDocument()
  })

  it('renders with role="alert"', () => {
    render(<Alert>Message</Alert>)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders a title when provided', () => {
    render(<Alert title="Warning">Details here</Alert>)
    expect(screen.getByText('Warning')).toBeInTheDocument()
    expect(screen.getByText('Warning').tagName).toBe('H3')
  })

  it('does not render a title when not provided', () => {
    render(<Alert>No title</Alert>)
    const alert = screen.getByRole('alert')
    expect(alert.querySelector('h3')).toBeNull()
  })

  describe('close button', () => {
    it('shows a close button when onClose is provided', () => {
      const handleClose = vi.fn()
      render(<Alert onClose={handleClose}>Closeable</Alert>)
      expect(screen.getByLabelText('Dismiss alert')).toBeInTheDocument()
    })

    it('does not show a close button when onClose is not provided', () => {
      render(<Alert>Not closeable</Alert>)
      expect(screen.queryByLabelText('Dismiss alert')).not.toBeInTheDocument()
    })

    it('calls onClose when the close button is clicked', () => {
      const handleClose = vi.fn()
      render(<Alert onClose={handleClose}>Closeable</Alert>)
      fireEvent.click(screen.getByLabelText('Dismiss alert'))
      expect(handleClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('variants', () => {
    it('renders info variant by default', () => {
      render(<Alert>Info message</Alert>)
      const alert = screen.getByRole('alert')
      expect(alert.className).toContain('border')
    })

    it('renders success variant', () => {
      render(<Alert variant="success">Success!</Alert>)
      const alert = screen.getByRole('alert')
      expect(alert.className).toContain('border')
    })

    it('renders error variant', () => {
      render(<Alert variant="error">Error occurred</Alert>)
      const alert = screen.getByRole('alert')
      expect(alert.className).toContain('border')
    })

    it('renders warning variant', () => {
      render(<Alert variant="warning">Be careful</Alert>)
      const alert = screen.getByRole('alert')
      expect(alert.className).toContain('border')
    })

    it('each variant renders a distinct icon', () => {
      const { unmount: u1 } = render(<Alert variant="info">Info</Alert>)
      const infoAlert = screen.getByRole('alert')
      const infoIcon = infoAlert.querySelector('svg')
      expect(infoIcon).toBeInTheDocument()
      u1()

      const { unmount: u2 } = render(<Alert variant="success">Success</Alert>)
      const successAlert = screen.getByRole('alert')
      const successIcon = successAlert.querySelector('svg')
      expect(successIcon).toBeInTheDocument()
      u2()

      const { unmount: u3 } = render(<Alert variant="error">Error</Alert>)
      const errorAlert = screen.getByRole('alert')
      const errorIcon = errorAlert.querySelector('svg')
      expect(errorIcon).toBeInTheDocument()
      u3()

      render(<Alert variant="warning">Warning</Alert>)
      const warningAlert = screen.getByRole('alert')
      const warningIcon = warningAlert.querySelector('svg')
      expect(warningIcon).toBeInTheDocument()
    })
  })

  it('merges custom className', () => {
    render(<Alert className="mt-4">Styled</Alert>)
    const alert = screen.getByRole('alert')
    expect(alert.className).toContain('mt-4')
  })
})
