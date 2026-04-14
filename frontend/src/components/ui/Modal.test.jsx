import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from './Modal'

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <p>Modal body content</p>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when isOpen is true', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal body content')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the title in the header', () => {
    render(<Modal {...defaultProps} />)
    const heading = screen.getByText('Test Modal')
    expect(heading.tagName).toBe('H2')
    expect(heading).toHaveAttribute('id', 'modal-title')
  })

  it('renders children in the body', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByText('Modal body content')).toBeInTheDocument()
  })

  it('renders footer when provided', () => {
    render(
      <Modal {...defaultProps} footer={<button>Save</button>} />
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('does not render footer when not provided', () => {
    render(<Modal {...defaultProps} />)
    // Only the close button should be present
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(1)
    expect(buttons[0]).toHaveAttribute('aria-label', 'Close modal')
  })

  it('calls onClose when the close button is clicked', () => {
    const handleClose = vi.fn()
    render(<Modal {...defaultProps} onClose={handleClose} />)
    fireEvent.click(screen.getByLabelText('Close modal'))
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the backdrop is clicked', () => {
    const handleClose = vi.fn()
    render(<Modal {...defaultProps} onClose={handleClose} />)
    // The backdrop is the outermost element with the fixed class
    const backdrop = screen.getByRole('dialog').parentElement
    fireEvent.click(backdrop)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when the dialog content area is clicked', () => {
    const handleClose = vi.fn()
    render(<Modal {...defaultProps} onClose={handleClose} />)
    fireEvent.click(screen.getByRole('dialog'))
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('calls onClose when the Escape key is pressed', () => {
    const handleClose = vi.fn()
    render(<Modal {...defaultProps} onClose={handleClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('sets aria-modal to true on the dialog', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('sets aria-labelledby when title is provided', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-title')
  })

  it('does not set aria-labelledby when title is not provided', () => {
    render(<Modal {...defaultProps} title={undefined} />)
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-labelledby')
  })

  it('hides body overflow when open', () => {
    render(<Modal {...defaultProps} />)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body overflow when closed', () => {
    const { unmount } = render(<Modal {...defaultProps} />)
    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('merges custom className onto the dialog container', () => {
    render(<Modal {...defaultProps} className="max-w-2xl" />)
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('max-w-2xl')
  })
})
