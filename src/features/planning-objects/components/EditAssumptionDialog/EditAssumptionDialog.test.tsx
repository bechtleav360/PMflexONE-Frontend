import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useEditAssumptionDialogStore } from '../../store/useEditAssumptionDialogStore'
import type { AssumptionListItem } from '../../types/assumption.types'
import { EditAssumptionDialog } from './EditAssumptionDialog'

const mockAssumption: AssumptionListItem = {
  id: 'a-1',
  version: 1,
  name: 'Test Assumption',
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
}

const mockMutateAsync = vi.fn().mockResolvedValue({})

vi.mock('../../hooks/useAssumption', () => ({
  useAssumption: () => ({ data: mockAssumption, isLoading: false }),
}))

vi.mock('../../hooks/useUpdateAssumption', () => ({
  useUpdateAssumption: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

vi.mock('./EditAssumptionForm', () => ({
  EditAssumptionForm: ({
    onSubmit,
    onNavigateToRisk,
  }: {
    onSubmit: (v: unknown) => void
    onNavigateToRisk?: (id: string) => void
  }) =>
    createElement(
      'div',
      null,
      createElement(
        'button',
        {
          'data-testid': 'assumption-edit-form-submit',
          type: 'button',
          onClick: () => onSubmit({ name: 'Updated', validationStatus: 'open', isRisk: false }),
        },
        'Submit',
      ),
      createElement(
        'button',
        {
          'data-testid': 'navigate-to-risk',
          type: 'button',
          onClick: () => onNavigateToRisk?.('risk-42'),
        },
        'Navigate to Risk',
      ),
    ),
}))

let queryClient: QueryClient

function renderDialog(onOpenRiskEntry?: (id: string) => void) {
  return render(createElement(EditAssumptionDialog, { scopeId: 'proj-1', onOpenRiskEntry }), {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(MemoryRouter, null, children),
      ),
  })
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  useEditAssumptionDialogStore.setState({ isOpen: false, assumptionId: null })
  vi.clearAllMocks()
})

describe('EditAssumptionDialog', () => {
  it('does not render content when store is closed', () => {
    renderDialog()
    expect(screen.queryByText('Assumptions')).not.toBeInTheDocument()
  })

  it('renders with loaded assumption data when open', () => {
    useEditAssumptionDialogStore.setState({ isOpen: true, assumptionId: 'a-1' })
    renderDialog()
    expect(screen.getByText('Assumptions')).toBeInTheDocument()
    expect(screen.getByTestId('assumption-edit-form-submit')).toBeInTheDocument()
  })

  it('calls useUpdateAssumption mutation on submit', async () => {
    useEditAssumptionDialogStore.setState({ isOpen: true, assumptionId: 'a-1' })
    renderDialog()
    await userEvent.click(screen.getByTestId('assumption-edit-form-submit'))
    expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({ id: 'a-1' }))
  })

  it('closes on Escape key', async () => {
    useEditAssumptionDialogStore.setState({ isOpen: true, assumptionId: 'a-1' })
    renderDialog()
    await userEvent.keyboard('{Escape}')
    expect(useEditAssumptionDialogStore.getState().isOpen).toBe(false)
  })

  it('calls onOpenRiskEntry with risk id when form triggers onNavigateToRisk', async () => {
    const onOpenRiskEntry = vi.fn()
    useEditAssumptionDialogStore.setState({ isOpen: true, assumptionId: 'a-1' })
    renderDialog(onOpenRiskEntry)
    await userEvent.click(screen.getByTestId('navigate-to-risk'))
    expect(onOpenRiskEntry).toHaveBeenCalledWith('risk-42')
  })

  it('closes dialog after onNavigateToRisk fires', async () => {
    useEditAssumptionDialogStore.setState({ isOpen: true, assumptionId: 'a-1' })
    renderDialog(vi.fn())
    await userEvent.click(screen.getByTestId('navigate-to-risk'))
    expect(useEditAssumptionDialogStore.getState().isOpen).toBe(false)
  })

  it('does not throw when onOpenRiskEntry is not provided and form triggers navigation', async () => {
    useEditAssumptionDialogStore.setState({ isOpen: true, assumptionId: 'a-1' })
    renderDialog()
    await expect(userEvent.click(screen.getByTestId('navigate-to-risk'))).resolves.not.toThrow()
  })
})
