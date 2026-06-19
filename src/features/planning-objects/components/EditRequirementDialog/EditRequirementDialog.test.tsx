import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useEditRequirementDialogStore } from '../../store/useEditRequirementDialogStore'
import { EditRequirementDialog } from './EditRequirementDialog'

const mockMutateAsync = vi.fn().mockResolvedValue({})

const mockDetail = {
  id: 'req-1',
  version: 1,
  name: 'Req 1',
  requirementScope: 'IN_SCOPE' as const,
  source: 'INTERNAL' as const,
  estimatedEffortMin: null,
  estimatedEffortMax: null,
  type: 'FUNCTIONAL' as const,
  priority: 'MUST_HAVE' as const,
  status: 'NEW' as const,
  description: null,
  acceptanceCriteria: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  creator: null,
  updater: null,
  parent: null,
  scope: { id: 'proj-1', type: 'Project' as const },
  dependencies: [],
  linkedGoals: [],
}

vi.mock('../../hooks/useRequirement', () => ({
  useRequirement: () => ({ data: mockDetail, isLoading: false }),
}))

vi.mock('../../hooks/useUpdateRequirement', () => ({
  useUpdateRequirement: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

vi.mock('./EditRequirementForm', () => ({
  EditRequirementForm: ({ onSubmit }: { onSubmit: (v: unknown) => void }) =>
    createElement(
      'button',
      {
        'data-testid': 'edit-req-form-submit',
        type: 'button',
        onClick: () => {
          onSubmit({ name: 'Updated' })
        },
      },
      'Submit',
    ),
}))

let queryClient: QueryClient

function renderDialog() {
  return render(createElement(EditRequirementDialog, { scopeId: 'proj-1' }), {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  })
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  useEditRequirementDialogStore.setState({ isOpen: false, requirementId: null })
  vi.clearAllMocks()
})

describe('EditRequirementDialog', () => {
  it('does not render content when store is closed', () => {
    renderDialog()
    expect(screen.queryByText('Requirements')).not.toBeInTheDocument()
  })

  it('opens when isOpen is true in store', () => {
    useEditRequirementDialogStore.setState({ isOpen: true, requirementId: 'req-1' })
    renderDialog()
    expect(screen.getByText('Requirements')).toBeInTheDocument()
  })

  it('closes on Escape key', async () => {
    useEditRequirementDialogStore.setState({ isOpen: true, requirementId: 'req-1' })
    renderDialog()
    await userEvent.keyboard('{Escape}')
    expect(useEditRequirementDialogStore.getState().isOpen).toBe(false)
  })

  it('calls useUpdateRequirement mutation on submit', async () => {
    useEditRequirementDialogStore.setState({ isOpen: true, requirementId: 'req-1' })
    renderDialog()
    await userEvent.click(screen.getByTestId('edit-req-form-submit'))
    expect(mockMutateAsync).toHaveBeenCalledOnce()
  })
})
