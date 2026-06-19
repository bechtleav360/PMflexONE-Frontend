/* eslint-disable max-lines -- comprehensive test coverage for RequirementManagement component */
import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { useCreateRequirementDialogStore } from '../../store/useCreateRequirementDialogStore'
import { useEditRequirementDialogStore } from '../../store/useEditRequirementDialogStore'
import type { RequirementListItem } from '../../types/requirement.types'
import { RequirementManagement } from './RequirementManagement'

function makeReq(overrides: Partial<RequirementListItem> = {}): RequirementListItem {
  return {
    id: 'req-1',
    version: 1,
    sortOrder: 0,
    name: 'Test Req',
    requirementScope: 'IN_SCOPE',
    source: 'INTERNAL',
    estimatedEffortMin: null,
    estimatedEffortMax: null,
    type: 'FUNCTIONAL',
    priority: 'MUST_HAVE',
    status: 'NEW',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    creator: null,
    parent: null,
    scope: { id: 'proj-1', scopeType: 'Project' },
    ...overrides,
  }
}

vi.mock('../../hooks/useRequirements', () => ({
  useRequirements: vi.fn(() => ({ data: [], isLoading: false, isError: false })),
}))

vi.mock('../../hooks/useDeleteRequirement', () => ({
  useDeleteRequirement: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}))

const mockReorderRequirements = vi.fn().mockResolvedValue(undefined)
vi.mock('../../hooks/useReorderRequirements', () => ({
  useReorderRequirements: vi.fn(() => ({ mutateAsync: mockReorderRequirements })),
}))

const { mockShowError } = vi.hoisted(() => ({ mockShowError: vi.fn() }))
vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponents>()
  return { ...actual, showError: mockShowError, showSuccess: vi.fn() }
})

vi.mock('../CreateRequirementDialog', () => ({
  CreateRequirementDialog: () => null,
}))

vi.mock('../EditRequirementDialog', () => ({
  EditRequirementDialog: () => null,
}))

vi.mock('../RequirementTree', () => ({
  RequirementTree: (props: {
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
      { 'data-testid': 'req-tree' },
      props.nodes.length === 0 ? 'No requirements yet' : `${props.nodes.length} requirements`,
      createElement('button', { onClick: () => props.onView?.('req-1') }, 'View'),
      createElement('button', { onClick: () => props.onEdit?.('req-1') }, 'Edit'),
      createElement('button', { onClick: () => props.onDelete('req-1') }, 'Delete'),
      createElement('button', { onClick: () => props.onAddChild?.('req-1') }, 'Add Child'),
      createElement('button', { onClick: () => props.onAddSibling?.('req-1') }, 'Add Sibling'),
      createElement('button', { onClick: () => props.onDragEnd?.('req-1', null) }, 'Drag Null'),
      createElement('button', { onClick: () => props.onDragEnd?.('req-1', 'req-2') }, 'Drag End'),
    )
  },
}))

let queryClient: QueryClient

function renderComponent() {
  return render(createElement(RequirementManagement, { scopeId: 'proj-1' }), {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  })
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  useCreateRequirementDialogStore.setState({ isOpen: false, parentId: null })
  useEditRequirementDialogStore.setState({ isOpen: false, requirementId: null, mode: 'edit' })
  vi.clearAllMocks()
})

// eslint-disable-next-line max-lines-per-function -- comprehensive test suite for complex UI component
describe('RequirementManagement', () => {
  it('renders empty state when no requirements', () => {
    renderComponent()
    expect(screen.getByText('No requirements yet')).toBeInTheDocument()
  })

  it('"Add Requirement" button opens create dialog', async () => {
    renderComponent()
    await userEvent.click(screen.getByText('Add Requirement'))
    expect(useCreateRequirementDialogStore.getState().isOpen).toBe(true)
  })

  it('shows loading spinner when isLoading is true', async () => {
    const { useRequirements } = await import('../../hooks/useRequirements')
    vi.mocked(useRequirements).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useRequirements>)

    renderComponent()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    expect(screen.queryByTestId('req-tree')).not.toBeInTheDocument()
  })

  it('shows error alert when isError is true', async () => {
    const { useRequirements } = await import('../../hooks/useRequirements')
    vi.mocked(useRequirements).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useRequirements>)

    renderComponent()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders DeleteWithChildrenDialog when req with children is deleted', async () => {
    const { useRequirements } = await import('../../hooks/useRequirements')
    vi.mocked(useRequirements).mockReturnValue({
      data: [makeReq({ id: 'req-1' }), makeReq({ id: 'req-child', parent: { id: 'req-1' } })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useRequirements>)

    renderComponent()
    await userEvent.click(screen.getByText('Delete'))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('deletes leaf requirement via confirm dialog', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    const { useRequirements } = await import('../../hooks/useRequirements')
    const { useDeleteRequirement } = await import('../../hooks/useDeleteRequirement')
    vi.mocked(useRequirements).mockReturnValue({
      data: [makeReq({ id: 'req-1' })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useRequirements>)
    vi.mocked(useDeleteRequirement).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteRequirement>)

    renderComponent()
    await userEvent.click(screen.getByText('Delete'))

    const dialog = screen.getByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))

    expect(mutateAsync).toHaveBeenCalledWith({ id: 'req-1', version: 1, cascade: false })
  })

  it('renders scope filter tabs with correct counts', async () => {
    const { useRequirements } = await import('../../hooks/useRequirements')
    vi.mocked(useRequirements).mockReturnValue({
      data: [
        makeReq({ id: 'req-1', requirementScope: 'IN_SCOPE' }),
        makeReq({ id: 'req-2', requirementScope: 'OUT_OF_SCOPE' }),
        makeReq({ id: 'req-3', requirementScope: 'IN_SCOPE' }),
      ],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useRequirements>)

    renderComponent()

    expect(screen.getByText('All (3)')).toBeInTheDocument()
    expect(screen.getByText('In Scope (2)')).toBeInTheDocument()
    expect(screen.getByText('Out of Scope (1)')).toBeInTheDocument()
  })

  it('handleAddSibling opens create dialog with parent id when req has a parent', async () => {
    const { useRequirements } = await import('../../hooks/useRequirements')
    vi.mocked(useRequirements).mockReturnValue({
      data: [
        makeReq({ id: 'req-1', parent: { id: 'parent-req' } as RequirementListItem['parent'] }),
      ],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useRequirements>)

    renderComponent()
    await userEvent.click(screen.getByText('Add Sibling'))
    expect(useCreateRequirementDialogStore.getState().parentId).toBe('parent-req')
  })

  it('handleDragEnd does nothing when overId is null', async () => {
    const { useRequirements } = await import('../../hooks/useRequirements')
    vi.mocked(useRequirements).mockReturnValue({
      data: [makeReq({ id: 'req-1' })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useRequirements>)

    renderComponent()
    await userEvent.click(screen.getByText('Drag Null'))
    expect(mockReorderRequirements).not.toHaveBeenCalled()
  })

  it('handleDragEnd calls reorderRequirements when both ids are valid', async () => {
    const { useRequirements } = await import('../../hooks/useRequirements')
    vi.mocked(useRequirements).mockReturnValue({
      data: [makeReq({ id: 'req-1' }), makeReq({ id: 'req-2' })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useRequirements>)

    renderComponent()
    await userEvent.click(screen.getByText('Drag End'))
    expect(mockReorderRequirements).toHaveBeenCalledWith(['req-2', 'req-1'])
  })

  it('shows error toast when delete mutation fails', async () => {
    const { useRequirements } = await import('../../hooks/useRequirements')
    const { useDeleteRequirement } = await import('../../hooks/useDeleteRequirement')
    vi.mocked(useRequirements).mockReturnValue({
      data: [makeReq({ id: 'req-1' })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useRequirements>)
    vi.mocked(useDeleteRequirement).mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(new Error('delete failed')),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteRequirement>)

    renderComponent()
    await userEvent.click(screen.getByText('Delete'))
    const dialog = screen.getByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(mockShowError).toHaveBeenCalled())
  })

  it('OUT_OF_SCOPE filter tab changes displayed requirements', async () => {
    const { useRequirements } = await import('../../hooks/useRequirements')
    vi.mocked(useRequirements).mockReturnValue({
      data: [
        makeReq({ id: 'req-1', requirementScope: 'IN_SCOPE' }),
        makeReq({ id: 'req-2', requirementScope: 'OUT_OF_SCOPE' }),
      ],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useRequirements>)

    renderComponent()
    await userEvent.click(screen.getByText('Out of Scope (1)'))
    expect(screen.getByText('1 requirements')).toBeInTheDocument()
  })

  it('filter tab changes displayed requirements', async () => {
    const { useRequirements } = await import('../../hooks/useRequirements')
    vi.mocked(useRequirements).mockReturnValue({
      data: [
        makeReq({ id: 'req-1', requirementScope: 'IN_SCOPE' }),
        makeReq({ id: 'req-2', requirementScope: 'OUT_OF_SCOPE' }),
      ],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useRequirements>)

    renderComponent()

    expect(screen.getByText('2 requirements')).toBeInTheDocument()

    await userEvent.click(screen.getByText('In Scope (1)'))
    expect(screen.getByText('1 requirements')).toBeInTheDocument()
  })

  it('handleAddChild opens create dialog with the req id as parent', async () => {
    const { useRequirements } = await import('../../hooks/useRequirements')
    vi.mocked(useRequirements).mockReturnValue({
      data: [makeReq({ id: 'req-1' })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useRequirements>)

    renderComponent()
    await userEvent.click(screen.getByText('Add Child'))
    expect(useCreateRequirementDialogStore.getState().parentId).toBe('req-1')
  })

  it('handleDeleteCascadeConfirm deletes with cascade when confirmed', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    const { useRequirements } = await import('../../hooks/useRequirements')
    const { useDeleteRequirement } = await import('../../hooks/useDeleteRequirement')
    vi.mocked(useRequirements).mockReturnValue({
      data: [makeReq({ id: 'req-1' }), makeReq({ id: 'req-child', parent: { id: 'req-1' } })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useRequirements>)
    vi.mocked(useDeleteRequirement).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteRequirement>)

    renderComponent()
    await userEvent.click(screen.getByText('Delete'))

    const alertdialog = screen.getByRole('alertdialog')
    await userEvent.click(within(alertdialog).getByText('Delete all'))

    expect(mutateAsync).toHaveBeenCalledWith({ id: 'req-1', version: 1, cascade: true })
  })

  it('closes DeleteWithChildrenDialog on cancel', async () => {
    const { useRequirements } = await import('../../hooks/useRequirements')
    vi.mocked(useRequirements).mockReturnValue({
      data: [makeReq({ id: 'req-1' }), makeReq({ id: 'req-child', parent: { id: 'req-1' } })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useRequirements>)

    renderComponent()
    await userEvent.click(screen.getByText('Delete'))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('handleView opens edit dialog in view mode', async () => {
    const { useRequirements } = await import('../../hooks/useRequirements')
    vi.mocked(useRequirements).mockReturnValue({
      data: [makeReq({ id: 'req-1' })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useRequirements>)

    renderComponent()
    await userEvent.click(screen.getByText('View'))
    expect(useEditRequirementDialogStore.getState()).toMatchObject({
      requirementId: 'req-1',
      mode: 'view',
    })
  })

  it('handleEdit opens edit dialog in edit mode', async () => {
    const { useRequirements } = await import('../../hooks/useRequirements')
    vi.mocked(useRequirements).mockReturnValue({
      data: [makeReq({ id: 'req-1' })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useRequirements>)

    renderComponent()
    await userEvent.click(screen.getByText('Edit'))
    expect(useEditRequirementDialogStore.getState()).toMatchObject({
      requirementId: 'req-1',
      mode: 'edit',
    })
  })
})
