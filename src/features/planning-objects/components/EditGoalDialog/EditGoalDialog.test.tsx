import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useEditGoalDialogStore } from '../../store/useEditGoalDialogStore'
import type { GoalDetail } from '../../types/goal.types'
import { EditGoalDialog } from './EditGoalDialog'

const mockGoalDetail: GoalDetail = {
  id: 'goal-1',
  version: 1,
  sortOrder: 0,
  name: 'Test Goal',
  description: null,
  progress: 50,
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
  relatedGoals: [],
  linkedRequirements: [],
  businessCase: null,
  projectCharter: null,
  initiationRequests: [],
  parentLevelGoal: null,
}

const mockMutateAsync = vi.fn().mockResolvedValue({})

vi.mock('../../hooks/useGoal', () => ({
  useGoal: () => ({ data: mockGoalDetail, isLoading: false }),
}))

vi.mock('../../hooks/useUpdateGoal', () => ({
  useUpdateGoal: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

vi.mock('./EditGoalForm', () => ({
  EditGoalForm: ({ onSubmit }: { onSubmit: (v: unknown) => void }) =>
    createElement(
      'button',
      {
        'data-testid': 'goal-edit-form-submit',
        type: 'button',
        onClick: () => {
          onSubmit({ name: 'Updated Goal' })
        },
      },
      'Submit',
    ),
}))

let queryClient: QueryClient

function renderDialog() {
  return render(createElement(EditGoalDialog, { scopeType: 'Project', scopeId: 'proj-1' }), {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  })
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  useEditGoalDialogStore.setState({ isOpen: false, goalId: null })
  vi.clearAllMocks()
})

describe('EditGoalDialog', () => {
  it('does not render content when store is closed', () => {
    renderDialog()
    expect(screen.queryByText('Goals')).not.toBeInTheDocument()
  })

  it('renders with loaded goal data when open', () => {
    useEditGoalDialogStore.setState({ isOpen: true, goalId: 'goal-1' })
    renderDialog()
    expect(screen.getByText('Goals')).toBeInTheDocument()
    expect(screen.getByTestId('goal-edit-form-submit')).toBeInTheDocument()
  })

  it('calls useUpdateGoal mutation on submit', async () => {
    useEditGoalDialogStore.setState({ isOpen: true, goalId: 'goal-1' })
    renderDialog()
    await userEvent.click(screen.getByTestId('goal-edit-form-submit'))
    expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({ id: 'goal-1' }))
  })

  it('closes on Escape key', async () => {
    useEditGoalDialogStore.setState({ isOpen: true, goalId: 'goal-1' })
    renderDialog()
    await userEvent.keyboard('{Escape}')
    expect(useEditGoalDialogStore.getState().isOpen).toBe(false)
  })
})
