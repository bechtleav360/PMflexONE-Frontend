import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { TooltipProvider } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { useCreateAssumptionDialogStore } from '../../store/useCreateAssumptionDialogStore'
import { useEditAssumptionDialogStore } from '../../store/useEditAssumptionDialogStore'
import type { AssumptionListItem } from '../../types/assumption.types'
import { AssumptionManagement } from './AssumptionManagement'

function makeAssumption(overrides: Partial<AssumptionListItem> = {}): AssumptionListItem {
  return {
    id: 'a-1',
    version: 1,
    name: 'Key assumption',
    description: null,
    dueDate: null,
    validationStatus: 'open',
    isRisk: false,
    otherInformation: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    creator: null,
    updater: null,
    validatedBy: null,
    linkedRisk: null,
    relatedRisks: [],
    projectCharter: null,
    scope: { id: 'proj-1', scopeType: 'Project' },
    ...overrides,
  }
}

vi.mock('../../hooks/useAssumptions', () => ({
  useAssumptions: vi.fn(() => ({ data: [], isLoading: false, isError: false })),
}))

vi.mock('../../hooks/useDeleteAssumption', () => ({
  useDeleteAssumption: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}))

const { mockShowError } = vi.hoisted(() => ({ mockShowError: vi.fn() }))
vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponents>()
  return { ...actual, showError: mockShowError }
})

vi.mock('../CreateAssumptionDialog', () => ({
  CreateAssumptionDialog: () => null,
}))

let capturedEditDialogProps: { scopeId?: string; onOpenRiskEntry?: (id: string) => void } = {}
vi.mock('../EditAssumptionDialog', () => ({
  EditAssumptionDialog: (props: { scopeId?: string; onOpenRiskEntry?: (id: string) => void }) => {
    capturedEditDialogProps = props
    return null
  },
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

function renderComponent(onOpenRiskEntry?: (id: string) => void) {
  return render(createElement(AssumptionManagement, { scopeId: 'proj-1', onOpenRiskEntry }), {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(TooltipProvider, null, createElement(MemoryRouter, null, children)),
      ),
  })
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  useCreateAssumptionDialogStore.setState({ isOpen: false })
  useEditAssumptionDialogStore.setState({ isOpen: false, assumptionId: null, mode: 'edit' })
  capturedEditDialogProps = {}
  vi.clearAllMocks()
})

// eslint-disable-next-line max-lines-per-function -- comprehensive test suite; many independent cases per branch
describe('AssumptionManagement', () => {
  it('renders empty state when no assumptions', () => {
    renderComponent()
    expect(screen.getByText('No assumptions yet')).toBeInTheDocument()
  })

  it('"Add Assumption" button opens create dialog', async () => {
    renderComponent()
    await userEvent.click(screen.getByText('Add Assumption'))
    expect(useCreateAssumptionDialogStore.getState().isOpen).toBe(true)
  })

  it('shows loading spinner when isLoading is true', async () => {
    const { useAssumptions } = await import('../../hooks/useAssumptions')
    vi.mocked(useAssumptions).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useAssumptions>)

    renderComponent()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('shows error alert when isError is true', async () => {
    const { useAssumptions } = await import('../../hooks/useAssumptions')
    vi.mocked(useAssumptions).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useAssumptions>)

    renderComponent()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders assumption list items', async () => {
    const { useAssumptions } = await import('../../hooks/useAssumptions')
    vi.mocked(useAssumptions).mockReturnValue({
      data: [makeAssumption({ name: 'Key assumption' })],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useAssumptions>)

    renderComponent()
    expect(screen.getByText('Key assumption')).toBeInTheDocument()
  })

  it('delete flow: request opens confirm dialog, confirm calls mutateAsync', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    const { useAssumptions } = await import('../../hooks/useAssumptions')
    const { useDeleteAssumption } = await import('../../hooks/useDeleteAssumption')
    vi.mocked(useAssumptions).mockReturnValue({
      data: [makeAssumption({ id: 'a-1', version: 1, name: 'Key assumption' })],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useAssumptions>)
    vi.mocked(useDeleteAssumption).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteAssumption>)

    renderComponent()
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /delete/i }))
    expect(screen.getByTestId('confirm-delete-dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Confirm Delete'))
    expect(mutateAsync).toHaveBeenCalledWith({ id: 'a-1', version: 1 })
  })

  it('delete flow: request → cancel hides confirm dialog', async () => {
    const { useAssumptions } = await import('../../hooks/useAssumptions')
    vi.mocked(useAssumptions).mockReturnValue({
      data: [makeAssumption({ id: 'a-1', name: 'Key assumption' })],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useAssumptions>)

    renderComponent()
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /delete/i }))
    expect(screen.getByTestId('confirm-delete-dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Cancel Delete'))
    expect(screen.queryByTestId('confirm-delete-dialog')).not.toBeInTheDocument()
  })

  it('shows isRisk badge when assumption is a risk', async () => {
    const { useAssumptions } = await import('../../hooks/useAssumptions')
    vi.mocked(useAssumptions).mockReturnValue({
      data: [makeAssumption({ isRisk: true })],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useAssumptions>)

    renderComponent()
    expect(screen.getByText('Is a risk')).toBeInTheDocument()
  })

  it('handleView opens edit dialog in view mode', async () => {
    const { useAssumptions } = await import('../../hooks/useAssumptions')
    vi.mocked(useAssumptions).mockReturnValue({
      data: [makeAssumption({ id: 'a-1', name: 'Key assumption' })],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useAssumptions>)

    renderComponent()
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /view/i }))
    expect(useEditAssumptionDialogStore.getState()).toMatchObject({
      assumptionId: 'a-1',
      mode: 'view',
    })
  })

  it('handleEdit opens edit dialog in edit mode', async () => {
    const { useAssumptions } = await import('../../hooks/useAssumptions')
    vi.mocked(useAssumptions).mockReturnValue({
      data: [makeAssumption({ id: 'a-1', name: 'Key assumption' })],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useAssumptions>)

    renderComponent()
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /edit/i }))
    expect(useEditAssumptionDialogStore.getState()).toMatchObject({
      assumptionId: 'a-1',
      mode: 'edit',
    })
  })

  it('forwards onOpenRiskEntry to EditAssumptionDialog', () => {
    const onOpenRiskEntry = vi.fn()
    renderComponent(onOpenRiskEntry)
    expect(capturedEditDialogProps.onOpenRiskEntry).toBe(onOpenRiskEntry)
  })

  it('passes undefined onOpenRiskEntry to EditAssumptionDialog when not provided', () => {
    renderComponent()
    expect(capturedEditDialogProps.onOpenRiskEntry).toBeUndefined()
  })

  it('shows error toast when delete mutation fails', async () => {
    const { useAssumptions } = await import('../../hooks/useAssumptions')
    const { useDeleteAssumption } = await import('../../hooks/useDeleteAssumption')
    vi.mocked(useAssumptions).mockReturnValue({
      data: [makeAssumption({ id: 'a-1', version: 1, name: 'Key assumption' })],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useAssumptions>)
    vi.mocked(useDeleteAssumption).mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(new Error('delete failed')),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteAssumption>)

    renderComponent()
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /delete/i }))
    await userEvent.click(screen.getByText('Confirm Delete'))
    await waitFor(() => expect(mockShowError).toHaveBeenCalled())
  })
})
