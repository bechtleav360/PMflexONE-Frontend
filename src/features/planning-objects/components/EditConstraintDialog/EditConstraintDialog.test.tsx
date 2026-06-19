import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useEditConstraintDialogStore } from '../../store/useEditConstraintDialogStore'
import type { ConstraintListItem } from '../../types/constraint.types'
import { EditConstraintDialog } from './EditConstraintDialog'

const mockConstraint: ConstraintListItem = {
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
}

const mockMutateAsync = vi.fn().mockResolvedValue({})

vi.mock('../../hooks/useUpdateConstraint', () => ({
  useUpdateConstraint: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

vi.mock('./EditConstraintForm', () => ({
  EditConstraintForm: ({ onSubmit }: { onSubmit: (v: unknown) => void }) =>
    createElement(
      'button',
      {
        'data-testid': 'constraint-edit-form-submit',
        type: 'button',
        onClick: () => {
          onSubmit({ name: 'Updated Constraint', timeConstrained: false })
        },
      },
      'Submit',
    ),
}))

let queryClient: QueryClient

function renderDialog(constraints: ConstraintListItem[] = [mockConstraint]) {
  return render(createElement(EditConstraintDialog, { scopeId: 'proj-1', constraints }), {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  })
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  useEditConstraintDialogStore.setState({ isOpen: false, constraintId: null })
  vi.clearAllMocks()
})

describe('EditConstraintDialog', () => {
  it('does not render content when store is closed', () => {
    renderDialog()
    expect(screen.queryByText('Constraints')).not.toBeInTheDocument()
  })

  it('renders with constraint data when open', () => {
    useEditConstraintDialogStore.setState({ isOpen: true, constraintId: 'c-1' })
    renderDialog()
    expect(screen.getByText('Constraints')).toBeInTheDocument()
    expect(screen.getByTestId('constraint-edit-form-submit')).toBeInTheDocument()
  })

  it('calls useUpdateConstraint mutation on submit', async () => {
    useEditConstraintDialogStore.setState({ isOpen: true, constraintId: 'c-1' })
    renderDialog()
    await userEvent.click(screen.getByTestId('constraint-edit-form-submit'))
    expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({ id: 'c-1' }))
  })

  it('closes on Escape key', async () => {
    useEditConstraintDialogStore.setState({ isOpen: true, constraintId: 'c-1' })
    renderDialog()
    await userEvent.keyboard('{Escape}')
    expect(useEditConstraintDialogStore.getState().isOpen).toBe(false)
  })
})
