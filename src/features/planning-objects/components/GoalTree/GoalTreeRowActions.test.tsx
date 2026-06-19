import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { GoalTreeRowActions } from './GoalTreeRowActions'

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponents>()
  return {
    ...actual,
    DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dropdown-content">{children}</div>
    ),
    DropdownMenuItem: ({
      children,
      onSelect,
    }: {
      children: React.ReactNode
      onSelect?: () => void
    }) => <button onClick={onSelect}>{children}</button>,
    DropdownMenuSeparator: () => <hr data-testid="separator" />,
  }
})

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

// eslint-disable-next-line max-lines-per-function -- comprehensive separator logic tests require many render variations
describe('GoalTreeRowActions', () => {
  it('renders view item when onView provided', () => {
    render(
      <GoalTreeRowActions
        goalId="g-1"
        onView={vi.fn()}
      />,
    )
    expect(screen.getByText(/view/i)).toBeInTheDocument()
  })

  it('renders edit item when onEdit provided', () => {
    render(
      <GoalTreeRowActions
        goalId="g-1"
        onEdit={vi.fn()}
      />,
    )
    expect(screen.getByText(/edit/i)).toBeInTheDocument()
  })

  it('renders addChild item when onAddChild provided', () => {
    render(
      <GoalTreeRowActions
        goalId="g-1"
        onAddChild={vi.fn()}
      />,
    )
    expect(screen.getByText(/add child/i)).toBeInTheDocument()
  })

  it('renders addSibling item when onAddSibling provided', () => {
    render(
      <GoalTreeRowActions
        goalId="g-1"
        onAddSibling={vi.fn()}
      />,
    )
    expect(screen.getByText(/add sibling/i)).toBeInTheDocument()
  })

  it('renders delete item when onDelete provided', () => {
    render(
      <GoalTreeRowActions
        goalId="g-1"
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText(/delete/i)).toBeInTheDocument()
  })

  it('calls onView with goalId when clicked', async () => {
    const onView = vi.fn()
    render(
      <GoalTreeRowActions
        goalId="g-1"
        onView={onView}
      />,
    )
    await userEvent.click(screen.getByText(/view/i))
    expect(onView).toHaveBeenCalledWith('g-1')
  })

  it('calls onEdit with goalId when clicked', async () => {
    const onEdit = vi.fn()
    render(
      <GoalTreeRowActions
        goalId="g-1"
        onEdit={onEdit}
      />,
    )
    await userEvent.click(screen.getByText(/edit/i))
    expect(onEdit).toHaveBeenCalledWith('g-1')
  })

  it('calls onAddChild with goalId when clicked', async () => {
    const onAddChild = vi.fn()
    render(
      <GoalTreeRowActions
        goalId="g-1"
        onAddChild={onAddChild}
      />,
    )
    await userEvent.click(screen.getByText(/add child/i))
    expect(onAddChild).toHaveBeenCalledWith('g-1')
  })

  it('calls onAddSibling with goalId when clicked', async () => {
    const onAddSibling = vi.fn()
    render(
      <GoalTreeRowActions
        goalId="g-1"
        onAddSibling={onAddSibling}
      />,
    )
    await userEvent.click(screen.getByText(/add sibling/i))
    expect(onAddSibling).toHaveBeenCalledWith('g-1')
  })

  it('calls onDelete with goalId when clicked', async () => {
    const onDelete = vi.fn()
    render(
      <GoalTreeRowActions
        goalId="g-1"
        onDelete={onDelete}
      />,
    )
    await userEvent.click(screen.getByText(/delete/i))
    expect(onDelete).toHaveBeenCalledWith('g-1')
  })

  it('renders first separator when add-actions and view/edit both present', () => {
    render(
      <GoalTreeRowActions
        goalId="g-1"
        onView={vi.fn()}
        onAddChild={vi.fn()}
      />,
    )
    expect(screen.getAllByTestId('separator').length).toBeGreaterThanOrEqual(1)
  })

  it('omits first separator when no view/edit callbacks', () => {
    render(
      <GoalTreeRowActions
        goalId="g-1"
        onAddChild={vi.fn()}
      />,
    )
    expect(screen.queryAllByTestId('separator')).toHaveLength(0)
  })

  it('renders delete separator when delete and at least one other action present', () => {
    render(
      <GoalTreeRowActions
        goalId="g-1"
        onView={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getAllByTestId('separator').length).toBeGreaterThanOrEqual(1)
  })

  it('omits delete separator when only delete provided', () => {
    render(
      <GoalTreeRowActions
        goalId="g-1"
        onDelete={vi.fn()}
      />,
    )
    expect(screen.queryAllByTestId('separator')).toHaveLength(0)
  })

  it('renders no items when no callbacks provided', () => {
    render(<GoalTreeRowActions goalId="g-1" />)
    expect(screen.queryByText(/view/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/edit/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/delete/i)).not.toBeInTheDocument()
  })
})
