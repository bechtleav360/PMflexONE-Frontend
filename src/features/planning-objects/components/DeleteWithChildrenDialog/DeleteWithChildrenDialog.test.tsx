import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DeleteWithChildrenDialog } from './DeleteWithChildrenDialog'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}))

const defaultProps = {
  isOpen: true,
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
  isPending: false,
}

describe('DeleteWithChildrenDialog', () => {
  it('renders the dialog title when open', () => {
    render(<DeleteWithChildrenDialog {...defaultProps} />)
    expect(screen.getByText('features.planningObjects.goals.deleteDialog.title')).toBeDefined()
  })

  it('"Delete all" button calls onConfirm(true)', async () => {
    const onConfirm = vi.fn()
    render(
      <DeleteWithChildrenDialog
        {...defaultProps}
        onConfirm={onConfirm}
      />,
    )

    await userEvent.click(screen.getByText('features.planningObjects.goals.deleteDialog.deleteAll'))
    expect(onConfirm).toHaveBeenCalledWith(true)
  })

  it('"Cancel" button calls onCancel', async () => {
    const onCancel = vi.fn()
    render(
      <DeleteWithChildrenDialog
        {...defaultProps}
        onCancel={onCancel}
      />,
    )

    await userEvent.click(screen.getByText('features.planningObjects.goals.deleteDialog.cancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('dialog content has aria-describedby pointing to description paragraph', () => {
    render(<DeleteWithChildrenDialog {...defaultProps} />)
    const content = screen.getByRole('alertdialog')
    const describedById = content.getAttribute('aria-describedby')
    expect(describedById).toBeTruthy()
    const descEl = document.getElementById(describedById!)
    expect(descEl).not.toBeNull()
  })

  it('disables both buttons when isPending=true', () => {
    render(
      <DeleteWithChildrenDialog
        {...defaultProps}
        isPending={true}
      />,
    )
    const buttons = screen.getAllByRole('button')
    const actionButtons = buttons.filter((b) =>
      [
        'features.planningObjects.goals.deleteDialog.deleteAll',
        'features.planningObjects.goals.deleteDialog.cancel',
      ].some((label) => b.textContent?.includes(label)),
    )
    actionButtons.forEach((btn) => expect(btn).toBeDisabled())
  })

  it('does not render when isOpen=false', () => {
    render(
      <DeleteWithChildrenDialog
        {...defaultProps}
        isOpen={false}
      />,
    )
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('renders count-specific description when childCount is provided', () => {
    render(
      <DeleteWithChildrenDialog
        {...defaultProps}
        childCount={3}
      />,
    )
    expect(
      screen.getByText('features.planningObjects.goals.deleteDialog.descriptionWithCount'),
    ).toBeInTheDocument()
  })

  it('renders generic description when childCount is omitted', () => {
    render(<DeleteWithChildrenDialog {...defaultProps} />)
    expect(
      screen.getByText('features.planningObjects.goals.deleteDialog.description'),
    ).toBeInTheDocument()
  })

  it('calls onCancel when dialog is closed via Escape key', async () => {
    const onCancel = vi.fn()
    render(
      <DeleteWithChildrenDialog
        {...defaultProps}
        onCancel={onCancel}
      />,
    )
    await userEvent.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalled()
  })
})
