import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { UnsavedLogsConfirmDialog } from './UnsavedLogsConfirmDialog'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('UnsavedLogsConfirmDialog', () => {
  it('does not render when open=false', () => {
    render(
      <UnsavedLogsConfirmDialog
        open={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog content when open=true', () => {
    render(
      <UnsavedLogsConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <UnsavedLogsConfirmDialog
        open={true}
        onClose={onClose}
        onConfirm={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /go back/i }))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <UnsavedLogsConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />,
    )

    await user.click(screen.getByRole('button', { name: /save without note/i }))

    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onClose when Escape key closes the dialog (onOpenChange with false)', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <UnsavedLogsConfirmDialog
        open={true}
        onClose={onClose}
        onConfirm={vi.fn()}
      />,
    )

    // Pressing Escape triggers Radix Dialog's onOpenChange(false), which calls onClose
    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledOnce()
  })
})
