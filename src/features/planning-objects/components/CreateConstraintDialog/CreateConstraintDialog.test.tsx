import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useCreateConstraintDialogStore } from '../../store/useCreateConstraintDialogStore'
import { CreateConstraintDialog } from './CreateConstraintDialog'

const mockMutateAsync = vi.fn().mockResolvedValue({})

vi.mock('../../hooks/useCreateConstraint', () => ({
  useCreateConstraint: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

vi.mock('./CreateConstraintForm', () => ({
  CreateConstraintForm: ({ onSubmit }: { onSubmit: (v: unknown) => void }) =>
    createElement(
      'button',
      {
        'data-testid': 'constraint-form-submit',
        type: 'button',
        onClick: () => {
          onSubmit({ name: 'Test Constraint', timeConstrained: false })
        },
      },
      'Submit',
    ),
}))

let queryClient: QueryClient

function renderDialog() {
  return render(createElement(CreateConstraintDialog, { scopeId: 'proj-1' }), {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  })
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  useCreateConstraintDialogStore.setState({ isOpen: false })
  vi.clearAllMocks()
})

describe('CreateConstraintDialog', () => {
  it('does not render content when store is closed', () => {
    renderDialog()
    expect(screen.queryByText('Add Constraint')).not.toBeInTheDocument()
  })

  it('opens when isOpen is true in store', () => {
    useCreateConstraintDialogStore.setState({ isOpen: true })
    renderDialog()
    expect(screen.getByText('Add Constraint')).toBeInTheDocument()
  })

  it('closes on Escape key', async () => {
    useCreateConstraintDialogStore.setState({ isOpen: true })
    renderDialog()
    await userEvent.keyboard('{Escape}')
    expect(useCreateConstraintDialogStore.getState().isOpen).toBe(false)
  })

  it('calls useCreateConstraint mutation on submit', async () => {
    useCreateConstraintDialogStore.setState({ isOpen: true })
    renderDialog()
    await userEvent.click(screen.getByTestId('constraint-form-submit'))
    expect(mockMutateAsync).toHaveBeenCalledWith({
      name: 'Test Constraint',
      timeConstrained: false,
    })
  })
})
