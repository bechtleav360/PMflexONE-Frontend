import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { RequirementTreeRowActions } from './RequirementTreeRowActions'

const defaultProps = {
  requirementId: 'req-1',
  onView: vi.fn(),
  onEdit: vi.fn(),
  onAddChild: vi.fn(),
  onAddSibling: vi.fn(),
  onDelete: vi.fn(),
}

async function openMenu() {
  await userEvent.click(screen.getByRole('button', { name: /row actions/i }))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('RequirementTreeRowActions', () => {
  it('renders the trigger button', () => {
    render(<RequirementTreeRowActions {...defaultProps} />)
    expect(screen.getByRole('button', { name: /row actions/i })).toBeInTheDocument()
  })

  it('calls onView with requirementId when View is clicked', async () => {
    const onView = vi.fn()
    render(
      <RequirementTreeRowActions
        {...defaultProps}
        onView={onView}
      />,
    )
    await openMenu()
    await userEvent.click(screen.getByRole('menuitem', { name: /view/i }))
    expect(onView).toHaveBeenCalledWith('req-1')
  })

  it('calls onEdit with requirementId when Edit is clicked', async () => {
    const onEdit = vi.fn()
    render(
      <RequirementTreeRowActions
        {...defaultProps}
        onEdit={onEdit}
      />,
    )
    await openMenu()
    await userEvent.click(screen.getByRole('menuitem', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith('req-1')
  })

  it('calls onAddChild with requirementId when Add child is clicked', async () => {
    const onAddChild = vi.fn()
    render(
      <RequirementTreeRowActions
        {...defaultProps}
        onAddChild={onAddChild}
      />,
    )
    await openMenu()
    await userEvent.click(screen.getByRole('menuitem', { name: /add child/i }))
    expect(onAddChild).toHaveBeenCalledWith('req-1')
  })

  it('calls onAddSibling with requirementId when Add sibling is clicked', async () => {
    const onAddSibling = vi.fn()
    render(
      <RequirementTreeRowActions
        {...defaultProps}
        onAddSibling={onAddSibling}
      />,
    )
    await openMenu()
    await userEvent.click(screen.getByRole('menuitem', { name: /add sibling/i }))
    expect(onAddSibling).toHaveBeenCalledWith('req-1')
  })

  it('calls onDelete with requirementId when Delete is clicked', async () => {
    const onDelete = vi.fn()
    render(
      <RequirementTreeRowActions
        {...defaultProps}
        onDelete={onDelete}
      />,
    )
    await openMenu()
    await userEvent.click(screen.getByRole('menuitem', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith('req-1')
  })
})
