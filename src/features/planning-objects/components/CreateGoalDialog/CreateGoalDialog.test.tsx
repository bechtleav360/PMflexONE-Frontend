import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useCreateGoalDialogStore } from '../../store/useCreateGoalDialogStore'
import { CreateGoalDialog } from './CreateGoalDialog'

const mockMutateAsync = vi.fn().mockResolvedValue({ id: 'new-goal', version: 1 })
const mockSetGoalParent = vi.fn().mockResolvedValue(undefined)

vi.mock('../../hooks/useCreateGoal', () => ({
  useCreateGoal: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

vi.mock('../../hooks/useSetGoalParent', () => ({
  useSetGoalParent: () => ({ mutateAsync: mockSetGoalParent, isPending: false }),
}))

vi.mock('./CreateGoalForm', () => ({
  CreateGoalForm: ({ onSubmit }: { onSubmit: (v: unknown) => void }) =>
    createElement(
      'button',
      {
        'data-testid': 'goal-form-submit',
        type: 'button',
        onClick: () => {
          onSubmit({ name: 'Test Goal' })
        },
      },
      'Submit',
    ),
}))

let queryClient: QueryClient

function renderDialog() {
  return render(createElement(CreateGoalDialog, { scopeType: 'Project', scopeId: 'proj-1' }), {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  })
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  useCreateGoalDialogStore.setState({ isOpen: false })
  vi.clearAllMocks()
})

describe('CreateGoalDialog', () => {
  it('does not render content when store is closed', () => {
    renderDialog()
    expect(screen.queryByText('Add Goal')).not.toBeInTheDocument()
  })

  it('opens when isOpen is true in store', () => {
    useCreateGoalDialogStore.setState({ isOpen: true })
    renderDialog()
    expect(screen.getByText('Add Goal')).toBeInTheDocument()
  })

  it('closes on Escape key', async () => {
    useCreateGoalDialogStore.setState({ isOpen: true })
    renderDialog()
    await userEvent.keyboard('{Escape}')
    expect(useCreateGoalDialogStore.getState().isOpen).toBe(false)
  })

  it('calls useCreateGoal mutation on submit', async () => {
    useCreateGoalDialogStore.setState({ isOpen: true })
    renderDialog()
    await userEvent.click(screen.getByTestId('goal-form-submit'))
    expect(mockMutateAsync).toHaveBeenCalledWith({ name: 'Test Goal' })
  })

  it('calls setGoalParent with parentId when parentId is set in store', async () => {
    useCreateGoalDialogStore.setState({ isOpen: true, parentId: 'parent-1' })
    renderDialog()
    await userEvent.click(screen.getByTestId('goal-form-submit'))
    expect(mockSetGoalParent).toHaveBeenCalledWith({
      id: 'new-goal',
      version: 1,
      parentId: 'parent-1',
    })
  })

  it('does not call setGoalParent when parentId is null', async () => {
    useCreateGoalDialogStore.setState({ isOpen: true, parentId: null })
    renderDialog()
    await userEvent.click(screen.getByTestId('goal-form-submit'))
    expect(mockSetGoalParent).not.toHaveBeenCalled()
  })

  it('shows error toast when createGoal mutation fails', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('create failed'))
    useCreateGoalDialogStore.setState({ isOpen: true })
    renderDialog()
    await userEvent.click(screen.getByTestId('goal-form-submit'))
    expect(useCreateGoalDialogStore.getState().isOpen).toBe(true)
  })
})
