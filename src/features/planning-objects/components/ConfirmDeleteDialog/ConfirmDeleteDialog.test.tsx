import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}))

const defaultProps = {
  open: true,
  isPending: false,
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
}

describe('ConfirmDeleteDialog', () => {
  it('renders dialog title when open', () => {
    render(<ConfirmDeleteDialog {...defaultProps} />)
    expect(screen.getByText('features.planningObjects.common.deleteTitle')).toBeInTheDocument()
  })

  it('does not render when open=false', () => {
    render(
      <ConfirmDeleteDialog
        {...defaultProps}
        open={false}
      />,
    )
    expect(
      screen.queryByText('features.planningObjects.common.deleteTitle'),
    ).not.toBeInTheDocument()
  })

  it('confirm button calls onConfirm', async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDeleteDialog
        {...defaultProps}
        onConfirm={onConfirm}
      />,
    )
    await userEvent.click(screen.getByText('features.planningObjects.common.deleteConfirmAction'))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('cancel button calls onCancel', async () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDeleteDialog
        {...defaultProps}
        onCancel={onCancel}
      />,
    )
    await userEvent.click(screen.getByText('features.planningObjects.common.deleteCancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('shows destructive children warning when hasChildren=true', () => {
    render(
      <ConfirmDeleteDialog
        {...defaultProps}
        hasChildren
      />,
    )
    expect(
      screen.getByText('features.planningObjects.common.deleteHasChildren'),
    ).toBeInTheDocument()
  })

  it('shows custom childrenWarning when provided', () => {
    render(
      <ConfirmDeleteDialog
        {...defaultProps}
        hasChildren
        childrenWarning="Custom warning text"
      />,
    )
    expect(screen.getByText('Custom warning text')).toBeInTheDocument()
  })

  it('does not show children warning when hasChildren=false', () => {
    render(<ConfirmDeleteDialog {...defaultProps} />)
    expect(
      screen.queryByText('features.planningObjects.common.deleteHasChildren'),
    ).not.toBeInTheDocument()
  })

  it('disables buttons while isPending=true', () => {
    render(
      <ConfirmDeleteDialog
        {...defaultProps}
        isPending
      />,
    )
    const cancelBtn = screen.getByText('features.planningObjects.common.deleteCancel')
    const confirmBtn = screen.getByText('features.planningObjects.common.deleteConfirmAction')
    expect(cancelBtn.closest('button')).toBeDisabled()
    expect(confirmBtn.closest('button')).toBeDisabled()
  })

  it('calls onCancel when dialog is closed via Escape key', async () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDeleteDialog
        {...defaultProps}
        onCancel={onCancel}
      />,
    )
    await userEvent.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalled()
  })
})
