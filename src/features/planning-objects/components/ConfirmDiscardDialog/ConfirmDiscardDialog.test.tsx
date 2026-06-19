import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmDiscardDialog } from './ConfirmDiscardDialog'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}))

const defaultProps = {
  open: true,
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
}

describe('ConfirmDiscardDialog', () => {
  it('renders dialog title when open', () => {
    render(<ConfirmDiscardDialog {...defaultProps} />)
    expect(screen.getByText('features.planningObjects.common.discardTitle')).toBeInTheDocument()
  })

  it('does not render when open=false', () => {
    render(
      <ConfirmDiscardDialog
        {...defaultProps}
        open={false}
      />,
    )
    expect(
      screen.queryByText('features.planningObjects.common.discardTitle'),
    ).not.toBeInTheDocument()
  })

  it('confirm button calls onConfirm', async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDiscardDialog
        {...defaultProps}
        onConfirm={onConfirm}
      />,
    )
    await userEvent.click(screen.getByText('features.planningObjects.common.discardConfirm'))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('cancel button calls onCancel', async () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDiscardDialog
        {...defaultProps}
        onCancel={onCancel}
      />,
    )
    await userEvent.click(screen.getByText('features.planningObjects.common.discardCancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('renders description text', () => {
    render(<ConfirmDiscardDialog {...defaultProps} />)
    expect(
      screen.getByText('features.planningObjects.common.discardDescription'),
    ).toBeInTheDocument()
  })

  it('calls onCancel when dialog is closed via Escape key', async () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDiscardDialog
        {...defaultProps}
        onCancel={onCancel}
      />,
    )
    await userEvent.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalled()
  })
})
