import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useCreateProblemEntryDialogStore } from '../../store/useCreateProblemEntryDialogStore'
import { CreateProblemEntryDialog } from './CreateProblemEntryDialog'

vi.mock('./CreateProblemEntryForm', () => ({
  CreateProblemEntryForm: () => createElement('div', { 'data-testid': 'problem-entry-form' }),
}))

let queryClient: QueryClient

function renderDialog() {
  return render(
    createElement(CreateProblemEntryDialog, {
      scopeType: 'Project',
      scopeId: 'e2e00000-0000-0000-0000-000000000001',
    }),
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
  useCreateProblemEntryDialogStore.setState({ isOpen: false })
})

describe('CreateProblemEntryDialog', () => {
  it('does not render dialog content when store is closed', () => {
    renderDialog()
    expect(screen.queryByText('New Problem')).not.toBeInTheDocument()
  })

  it('renders dialog title when store is open', () => {
    useCreateProblemEntryDialogStore.setState({ isOpen: true })
    renderDialog()
    expect(screen.getByText('New Problem')).toBeInTheDocument()
  })

  it('renders the form when open', () => {
    useCreateProblemEntryDialogStore.setState({ isOpen: true })
    renderDialog()
    expect(screen.getByTestId('problem-entry-form')).toBeInTheDocument()
  })

  it('calls close when dialog is dismissed via Escape', async () => {
    useCreateProblemEntryDialogStore.setState({ isOpen: true })
    renderDialog()
    await userEvent.keyboard('{Escape}')
    expect(useCreateProblemEntryDialogStore.getState().isOpen).toBe(false)
  })
})
