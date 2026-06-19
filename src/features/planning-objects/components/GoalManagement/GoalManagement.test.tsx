/* eslint-disable max-lines -- comprehensive test coverage for GoalManagement component */
import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { useCreateGoalDialogStore } from '../../store/useCreateGoalDialogStore'
import { useEditGoalDialogStore } from '../../store/useEditGoalDialogStore'
import type { GoalListItem } from '../../types/goal.types'
import { GoalManagement } from './GoalManagement'

function makeGoal(overrides: Partial<GoalListItem> = {}): GoalListItem {
  return {
    id: 'goal-1',
    version: 1,
    sortOrder: 0,
    name: 'Test Goal',
    description: null,
    progress: 0,
    dueDate: null,
    keyResults: null,
    impact: null,
    outcome: null,
    otherInformation: null,
    acceptedAt: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    creator: null,
    updater: null,
    acceptedBy: null,
    parent: null,
    children: [],
    scope: { id: 'proj-1', scopeType: 'Project' },
    parentLevelGoalName: null,
    ...overrides,
  }
}

vi.mock('../../hooks/useGoals', () => ({
  useGoals: vi.fn(() => ({ data: [], isLoading: false, isError: false })),
}))

vi.mock('../../hooks/useDeleteGoal', () => ({
  useDeleteGoal: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}))

const mockReorderGoals = vi.fn().mockResolvedValue(undefined)
vi.mock('../../hooks/useReorderGoals', () => ({
  useReorderGoals: vi.fn(() => ({ mutateAsync: mockReorderGoals })),
}))

const { mockShowError } = vi.hoisted(() => ({ mockShowError: vi.fn() }))
vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponents>()
  return { ...actual, showError: mockShowError, showSuccess: vi.fn() }
})

vi.mock('../CreateGoalDialog', () => ({
  CreateGoalDialog: () => null,
}))

vi.mock('../EditGoalDialog', () => ({
  EditGoalDialog: () => null,
}))

const mockOnDelete = vi.fn()

vi.mock('../GoalTree', () => ({
  GoalTree: (props: {
    nodes: unknown[]
    isLoading?: boolean
    isError?: boolean
    onView?: (id: string) => void
    onEdit?: (id: string) => void
    onDelete: (id: string) => void
    onAddChild?: (id: string) => void
    onAddSibling?: (id: string) => void
    onDragEnd?: (activeId: string, overId: string | null) => void
  }) => {
    if (props.isLoading) return createElement('div', { className: 'animate-spin' })
    if (props.isError) return createElement('div', { role: 'alert' }, 'Error')
    return createElement(
      'div',
      { 'data-testid': 'goal-tree' },
      props.nodes.length === 0 ? 'No goals yet' : `${props.nodes.length} goals`,
      createElement('button', { onClick: () => props.onView?.('goal-1') }, 'View'),
      createElement('button', { onClick: () => props.onEdit?.('goal-1') }, 'Edit'),
      createElement(
        'button',
        {
          onClick: () => {
            mockOnDelete('goal-1')
            props.onDelete('goal-1')
          },
        },
        'Delete',
      ),
      createElement('button', { onClick: () => props.onAddChild?.('goal-1') }, 'Add Child'),
      createElement('button', { onClick: () => props.onAddSibling?.('goal-1') }, 'Add Sibling'),
      createElement('button', { onClick: () => props.onDragEnd?.('goal-1', null) }, 'Drag Null'),
      createElement('button', { onClick: () => props.onDragEnd?.('goal-1', 'goal-2') }, 'Drag End'),
    )
  },
}))

let queryClient: QueryClient

function renderComponent() {
  return render(createElement(GoalManagement, { scopeType: 'Project', scopeId: 'proj-1' }), {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  })
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  useCreateGoalDialogStore.setState({ isOpen: false, parentId: null })
  useEditGoalDialogStore.setState({ isOpen: false, goalId: null, mode: 'edit' })
  vi.clearAllMocks()
})

// eslint-disable-next-line max-lines-per-function -- comprehensive test suite for complex UI component
describe('GoalManagement', () => {
  it('renders empty state when no goals', () => {
    renderComponent()
    expect(screen.getByText('No goals yet')).toBeInTheDocument()
  })

  it('"Add Goal" button opens create dialog', async () => {
    renderComponent()
    await userEvent.click(screen.getByText('Add Goal'))
    expect(useCreateGoalDialogStore.getState().isOpen).toBe(true)
  })

  it('shows loading spinner when isLoading is true', async () => {
    const { useGoals } = await import('../../hooks/useGoals')
    vi.mocked(useGoals).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useGoals>)

    renderComponent()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    expect(screen.queryByTestId('goal-tree')).not.toBeInTheDocument()
  })

  it('shows error alert when isError is true', async () => {
    const { useGoals } = await import('../../hooks/useGoals')
    vi.mocked(useGoals).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useGoals>)

    renderComponent()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('deletes leaf goal via confirm dialog', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    const { useGoals } = await import('../../hooks/useGoals')
    const { useDeleteGoal } = await import('../../hooks/useDeleteGoal')
    vi.mocked(useGoals).mockReturnValue({
      data: [makeGoal({ id: 'goal-1', children: [] })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGoals>)
    vi.mocked(useDeleteGoal).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteGoal>)

    renderComponent()
    await userEvent.click(screen.getByText('Delete'))

    const dialog = screen.getByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))

    expect(mutateAsync).toHaveBeenCalledWith({ id: 'goal-1', version: 1, cascade: false })
  })

  it('search filters the goal tree', async () => {
    const { useGoals } = await import('../../hooks/useGoals')
    vi.mocked(useGoals).mockReturnValue({
      data: [
        makeGoal({ id: 'g-1', name: 'Alpha Goal' }),
        makeGoal({ id: 'g-2', name: 'Beta Goal' }),
      ],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGoals>)

    renderComponent()
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'Alpha')
    expect(screen.getByText('1 goals')).toBeInTheDocument()
  })

  it('renders DeleteWithChildrenDialog when goal with children is deleted', async () => {
    const { useGoals } = await import('../../hooks/useGoals')
    vi.mocked(useGoals).mockReturnValue({
      data: [makeGoal({ id: 'goal-1' }), makeGoal({ id: 'child-1', parent: { id: 'goal-1' } })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGoals>)

    renderComponent()
    await userEvent.click(screen.getByText('Delete'))

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('handleAddSibling opens create dialog with parent id when goal has a parent', async () => {
    const { useGoals } = await import('../../hooks/useGoals')
    vi.mocked(useGoals).mockReturnValue({
      data: [makeGoal({ id: 'goal-1', parent: { id: 'parent-goal' } as GoalListItem['parent'] })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGoals>)

    renderComponent()
    await userEvent.click(screen.getByText('Add Sibling'))
    expect(useCreateGoalDialogStore.getState().parentId).toBe('parent-goal')
  })

  it('handleAddSibling opens create dialog with null parent when goal has no parent', async () => {
    const { useGoals } = await import('../../hooks/useGoals')
    vi.mocked(useGoals).mockReturnValue({
      data: [makeGoal({ id: 'goal-1', parent: null })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGoals>)

    renderComponent()
    await userEvent.click(screen.getByText('Add Sibling'))
    expect(useCreateGoalDialogStore.getState().parentId).toBeNull()
  })

  it('handleDragEnd does nothing when overId is null', async () => {
    const { useGoals } = await import('../../hooks/useGoals')
    vi.mocked(useGoals).mockReturnValue({
      data: [makeGoal({ id: 'goal-1' })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGoals>)

    renderComponent()
    await userEvent.click(screen.getByText('Drag Null'))
    expect(mockReorderGoals).not.toHaveBeenCalled()
  })

  it('handleDragEnd calls reorderGoals when both ids are valid', async () => {
    const { useGoals } = await import('../../hooks/useGoals')
    vi.mocked(useGoals).mockReturnValue({
      data: [makeGoal({ id: 'goal-1' }), makeGoal({ id: 'goal-2' })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGoals>)

    renderComponent()
    await userEvent.click(screen.getByText('Drag End'))
    expect(mockReorderGoals).toHaveBeenCalledWith(['goal-2', 'goal-1'])
  })

  it('shows error toast when delete mutation fails', async () => {
    const { useGoals } = await import('../../hooks/useGoals')
    const { useDeleteGoal } = await import('../../hooks/useDeleteGoal')
    vi.mocked(useGoals).mockReturnValue({
      data: [makeGoal({ id: 'goal-1', children: [] })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGoals>)
    vi.mocked(useDeleteGoal).mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(new Error('delete failed')),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteGoal>)

    renderComponent()
    await userEvent.click(screen.getByText('Delete'))
    const dialog = screen.getByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(mockShowError).toHaveBeenCalled())
  })

  it('closes dialog on cancel', async () => {
    const { useGoals } = await import('../../hooks/useGoals')
    vi.mocked(useGoals).mockReturnValue({
      data: [makeGoal({ id: 'goal-1' }), makeGoal({ id: 'child-1', parent: { id: 'goal-1' } })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGoals>)

    renderComponent()
    await userEvent.click(screen.getByText('Delete'))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('handleView opens edit dialog in view mode', async () => {
    const { useGoals } = await import('../../hooks/useGoals')
    vi.mocked(useGoals).mockReturnValue({
      data: [makeGoal({ id: 'goal-1' })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGoals>)

    renderComponent()
    await userEvent.click(screen.getByText('View'))
    expect(useEditGoalDialogStore.getState()).toMatchObject({ goalId: 'goal-1', mode: 'view' })
  })

  it('handleAddChild opens create dialog with the goal id as parent', async () => {
    const { useGoals } = await import('../../hooks/useGoals')
    vi.mocked(useGoals).mockReturnValue({
      data: [makeGoal({ id: 'goal-1' })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGoals>)

    renderComponent()
    await userEvent.click(screen.getByText('Add Child'))
    expect(useCreateGoalDialogStore.getState().parentId).toBe('goal-1')
  })

  it('handleDeleteCascadeConfirm deletes with cascade when confirmed', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    const { useGoals } = await import('../../hooks/useGoals')
    const { useDeleteGoal } = await import('../../hooks/useDeleteGoal')
    vi.mocked(useGoals).mockReturnValue({
      data: [makeGoal({ id: 'goal-1' }), makeGoal({ id: 'child-1', parent: { id: 'goal-1' } })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGoals>)
    vi.mocked(useDeleteGoal).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteGoal>)

    renderComponent()
    await userEvent.click(screen.getByText('Delete'))

    const alertdialog = screen.getByRole('alertdialog')
    await userEvent.click(within(alertdialog).getByText('Delete all'))

    expect(mutateAsync).toHaveBeenCalledWith({ id: 'goal-1', version: 1, cascade: true })
  })

  it('handleEdit opens edit dialog in edit mode', async () => {
    const { useGoals } = await import('../../hooks/useGoals')
    vi.mocked(useGoals).mockReturnValue({
      data: [makeGoal({ id: 'goal-1' })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGoals>)

    renderComponent()
    await userEvent.click(screen.getByText('Edit'))
    expect(useEditGoalDialogStore.getState()).toMatchObject({ goalId: 'goal-1', mode: 'edit' })
  })
})
