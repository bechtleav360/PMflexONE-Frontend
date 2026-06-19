import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useCreateAssumptionDialogStore } from '../../store/useCreateAssumptionDialogStore'
import { CreateAssumptionDialog } from './CreateAssumptionDialog'

const mockMutateAsync = vi.fn().mockResolvedValue({})

vi.mock('../../hooks/useCreateAssumption', () => ({
  useCreateAssumption: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

vi.mock('./CreateAssumptionForm', () => ({
  CreateAssumptionForm: ({ onSubmit }: { onSubmit: (v: unknown) => void }) =>
    createElement(
      'button',
      {
        'data-testid': 'assumption-form-submit',
        type: 'button',
        onClick: () => {
          onSubmit({ name: 'Test Assumption', validationStatus: 'open', isRisk: false })
        },
      },
      'Submit',
    ),
}))

let queryClient: QueryClient

function renderDialog() {
  return render(createElement(CreateAssumptionDialog, { scopeId: 'proj-1' }), {
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
  useCreateAssumptionDialogStore.setState({ isOpen: false })
  vi.clearAllMocks()
})

describe('CreateAssumptionDialog', () => {
  it('does not render content when store is closed', () => {
    renderDialog()
    expect(screen.queryByText('Add Assumption')).not.toBeInTheDocument()
  })

  it('opens when isOpen is true in store', () => {
    useCreateAssumptionDialogStore.setState({ isOpen: true })
    renderDialog()
    expect(screen.getByText('Add Assumption')).toBeInTheDocument()
  })

  it('closes on Escape key', async () => {
    useCreateAssumptionDialogStore.setState({ isOpen: true })
    renderDialog()
    await userEvent.keyboard('{Escape}')
    expect(useCreateAssumptionDialogStore.getState().isOpen).toBe(false)
  })

  it('calls useCreateAssumption mutation on submit', async () => {
    useCreateAssumptionDialogStore.setState({ isOpen: true })
    renderDialog()
    await userEvent.click(screen.getByTestId('assumption-form-submit'))
    expect(mockMutateAsync).toHaveBeenCalledWith({
      name: 'Test Assumption',
      validationStatus: 'open',
      isRisk: false,
    })
  })
})
