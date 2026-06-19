import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { TooltipProvider } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { useCreateConstraintDialogStore } from '../../store/useCreateConstraintDialogStore'
import { useEditConstraintDialogStore } from '../../store/useEditConstraintDialogStore'
import type { ConstraintListItem } from '../../types/constraint.types'
import { ConstraintManagement } from './ConstraintManagement'

function makeConstraint(overrides: Partial<ConstraintListItem> = {}): ConstraintListItem {
  return {
    id: 'c-1',
    version: 1,
    name: 'Budget cap',
    description: null,
    timeConstrained: false,
    dueDate: null,
    otherInformation: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    creator: null,
    updater: null,
    owner: null,
    projectCharter: null,
    scope: { id: 'proj-1', scopeType: 'Project' },
    ...overrides,
  }
}

vi.mock('../../hooks/useConstraints', () => ({
  useConstraints: vi.fn(() => ({ data: [], isLoading: false, isError: false })),
}))

vi.mock('../../hooks/useDeleteConstraint', () => ({
  useDeleteConstraint: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}))

const { mockShowError } = vi.hoisted(() => ({ mockShowError: vi.fn() }))
vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponents>()
  return { ...actual, showError: mockShowError }
})

vi.mock('../CreateConstraintDialog', () => ({
  CreateConstraintDialog: () => null,
}))

vi.mock('../EditConstraintDialog', () => ({
  EditConstraintDialog: () => null,
}))

vi.mock('../ConfirmDeleteDialog/ConfirmDeleteDialog', () => ({
  ConfirmDeleteDialog: ({
    open,
    onConfirm,
    onCancel,
  }: {
    open: boolean
    onConfirm: () => void
    onCancel: () => void
  }) =>
    open
      ? createElement(
          'div',
          { 'data-testid': 'confirm-delete-dialog' },
          createElement('button', { onClick: onConfirm }, 'Confirm Delete'),
          createElement('button', { onClick: onCancel }, 'Cancel Delete'),
        )
      : null,
}))

let queryClient: QueryClient

function renderComponent() {
  return render(createElement(ConstraintManagement, { scopeId: 'proj-1' }), {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(TooltipProvider, null, children),
      ),
  })
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  useCreateConstraintDialogStore.setState({ isOpen: false })
  useEditConstraintDialogStore.setState({ isOpen: false, constraintId: null, mode: 'edit' })
  vi.clearAllMocks()
})

// eslint-disable-next-line max-lines-per-function -- comprehensive test suite for complex UI component
describe('ConstraintManagement', () => {
  it('renders empty state when no constraints', () => {
    renderComponent()
    expect(screen.getByText('No constraints yet')).toBeInTheDocument()
  })

  it('"Add Constraint" button opens create dialog', async () => {
    renderComponent()
    await userEvent.click(screen.getByText('Add Constraint'))
    expect(useCreateConstraintDialogStore.getState().isOpen).toBe(true)
  })

  it('shows loading spinner when isLoading is true', async () => {
    const { useConstraints } = await import('../../hooks/useConstraints')
    vi.mocked(useConstraints).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useConstraints>)

    renderComponent()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('shows error alert when isError is true', async () => {
    const { useConstraints } = await import('../../hooks/useConstraints')
    vi.mocked(useConstraints).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useConstraints>)

    renderComponent()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders constraint list items', async () => {
    const { useConstraints } = await import('../../hooks/useConstraints')
    vi.mocked(useConstraints).mockReturnValue({
      data: [makeConstraint({ name: 'Budget cap' })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useConstraints>)

    renderComponent()
    expect(screen.getByText('Budget cap')).toBeInTheDocument()
  })

  it('delete flow: request opens confirm dialog, confirm calls mutateAsync', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    const { useConstraints } = await import('../../hooks/useConstraints')
    const { useDeleteConstraint } = await import('../../hooks/useDeleteConstraint')
    vi.mocked(useConstraints).mockReturnValue({
      data: [makeConstraint({ id: 'c-1', version: 1, name: 'Budget cap' })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useConstraints>)
    vi.mocked(useDeleteConstraint).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteConstraint>)

    renderComponent()
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /delete/i }))
    expect(screen.getByTestId('confirm-delete-dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Confirm Delete'))
    expect(mutateAsync).toHaveBeenCalledWith({ id: 'c-1', version: 1 })
  })

  it('delete flow: request → cancel hides confirm dialog', async () => {
    const { useConstraints } = await import('../../hooks/useConstraints')
    vi.mocked(useConstraints).mockReturnValue({
      data: [makeConstraint({ id: 'c-1', name: 'Budget cap' })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useConstraints>)

    renderComponent()
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /delete/i }))
    expect(screen.getByTestId('confirm-delete-dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Cancel Delete'))
    expect(screen.queryByTestId('confirm-delete-dialog')).not.toBeInTheDocument()
  })

  it('shows time-bound label when timeConstrained is true', async () => {
    const { useConstraints } = await import('../../hooks/useConstraints')
    vi.mocked(useConstraints).mockReturnValue({
      data: [makeConstraint({ timeConstrained: true, dueDate: '2024-12-31' })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useConstraints>)

    renderComponent()
    expect(screen.getByText(/Time-bound/)).toBeInTheDocument()
  })

  it('does not show deadline when timeConstrained is false', async () => {
    const { useConstraints } = await import('../../hooks/useConstraints')
    vi.mocked(useConstraints).mockReturnValue({
      data: [makeConstraint({ timeConstrained: false, dueDate: null })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useConstraints>)

    renderComponent()
    expect(screen.queryByText(/Time-bound/)).not.toBeInTheDocument()
  })

  it('handleView opens edit dialog in view mode', async () => {
    const { useConstraints } = await import('../../hooks/useConstraints')
    vi.mocked(useConstraints).mockReturnValue({
      data: [makeConstraint({ id: 'c-1', name: 'Budget cap' })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useConstraints>)

    renderComponent()
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /view/i }))
    expect(useEditConstraintDialogStore.getState()).toMatchObject({
      constraintId: 'c-1',
      mode: 'view',
    })
  })

  it('handleEdit opens edit dialog in edit mode', async () => {
    const { useConstraints } = await import('../../hooks/useConstraints')
    vi.mocked(useConstraints).mockReturnValue({
      data: [makeConstraint({ id: 'c-1', name: 'Budget cap' })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useConstraints>)

    renderComponent()
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /edit/i }))
    expect(useEditConstraintDialogStore.getState()).toMatchObject({
      constraintId: 'c-1',
      mode: 'edit',
    })
  })

  it('shows error toast when delete mutation fails', async () => {
    const { useConstraints } = await import('../../hooks/useConstraints')
    const { useDeleteConstraint } = await import('../../hooks/useDeleteConstraint')
    vi.mocked(useConstraints).mockReturnValue({
      data: [makeConstraint({ id: 'c-1', version: 1, name: 'Budget cap' })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useConstraints>)
    vi.mocked(useDeleteConstraint).mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(new Error('delete failed')),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteConstraint>)

    renderComponent()
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /delete/i }))
    await userEvent.click(screen.getByText('Confirm Delete'))
    await waitFor(() => expect(mockShowError).toHaveBeenCalled())
  })
})
