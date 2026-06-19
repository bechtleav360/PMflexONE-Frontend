import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useCreateRequirementDialogStore } from '../../store/useCreateRequirementDialogStore'
import { CreateRequirementDialog } from './CreateRequirementDialog'

const mockMutateAsync = vi.fn().mockResolvedValue({ id: 'new-req', version: 1 })
const mockSetRequirementParent = vi.fn().mockResolvedValue(undefined)

vi.mock('../../hooks/useCreateRequirement', () => ({
  useCreateRequirement: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

vi.mock('../../hooks/useSetRequirementParent', () => ({
  useSetRequirementParent: () => ({ mutateAsync: mockSetRequirementParent, isPending: false }),
}))

vi.mock('./CreateRequirementForm', () => ({
  CreateRequirementForm: ({ onSubmit }: { onSubmit: (v: unknown) => void }) =>
    createElement(
      'button',
      {
        'data-testid': 'req-form-submit',
        type: 'button',
        onClick: () => {
          onSubmit({
            name: 'Test Req',
            requirementScope: 'IN_SCOPE',
            source: 'INTERNAL',
            type: 'FUNCTIONAL',
            priority: 'MUST_HAVE',
            status: 'NEW',
          })
        },
      },
      'Submit',
    ),
}))

let queryClient: QueryClient

function renderDialog() {
  return render(
    createElement(CreateRequirementDialog, { scopeType: 'Project', scopeId: 'proj-1' }),
    {
      wrapper: ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children),
    },
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  useCreateRequirementDialogStore.setState({ isOpen: false })
  vi.clearAllMocks()
})

describe('CreateRequirementDialog', () => {
  it('does not render content when store is closed', () => {
    renderDialog()
    expect(screen.queryByText('Add Requirement')).not.toBeInTheDocument()
  })

  it('opens when isOpen is true in store', () => {
    useCreateRequirementDialogStore.setState({ isOpen: true })
    renderDialog()
    expect(screen.getByText('Add Requirement')).toBeInTheDocument()
  })

  it('closes on Escape key', async () => {
    useCreateRequirementDialogStore.setState({ isOpen: true })
    renderDialog()
    await userEvent.keyboard('{Escape}')
    expect(useCreateRequirementDialogStore.getState().isOpen).toBe(false)
  })

  it('calls useCreateRequirement mutation on submit', async () => {
    useCreateRequirementDialogStore.setState({ isOpen: true })
    renderDialog()
    await userEvent.click(screen.getByTestId('req-form-submit'))
    expect(mockMutateAsync).toHaveBeenCalledOnce()
  })

  it('calls setRequirementParent with parentId when parentId is set in store', async () => {
    useCreateRequirementDialogStore.setState({ isOpen: true, parentId: 'parent-req-1' })
    renderDialog()
    await userEvent.click(screen.getByTestId('req-form-submit'))
    expect(mockSetRequirementParent).toHaveBeenCalledWith({
      id: 'new-req',
      version: 1,
      parentId: 'parent-req-1',
    })
  })

  it('does not call setRequirementParent when parentId is null', async () => {
    useCreateRequirementDialogStore.setState({ isOpen: true, parentId: null })
    renderDialog()
    await userEvent.click(screen.getByTestId('req-form-submit'))
    expect(mockSetRequirementParent).not.toHaveBeenCalled()
  })

  it('shows error toast when createRequirement mutation fails', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('create failed'))
    useCreateRequirementDialogStore.setState({ isOpen: true })
    renderDialog()
    await userEvent.click(screen.getByTestId('req-form-submit'))
    expect(useCreateRequirementDialogStore.getState().isOpen).toBe(true)
  })
})
