import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useCreateIssueEntryDialogStore } from '../../store/useCreateIssueEntryDialogStore'
import { CreateIssueEntryDialog } from './CreateIssueEntryDialog'

vi.mock('./CreateIssueEntryForm', () => ({
  CreateIssueEntryForm: () => createElement('div', { 'data-testid': 'issue-entry-form' }),
}))

let queryClient: QueryClient

function renderDialog() {
  return render(
    createElement(CreateIssueEntryDialog, {
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
  useCreateIssueEntryDialogStore.setState({ isOpen: false })
})

describe('CreateIssueEntryDialog', () => {
  it('does not render dialog content when store is closed', () => {
    renderDialog()
    expect(screen.queryByText('New Issue')).not.toBeInTheDocument()
  })

  it('renders dialog title when store is open', () => {
    useCreateIssueEntryDialogStore.setState({ isOpen: true })
    renderDialog()
    expect(screen.getByText('New Issue')).toBeInTheDocument()
  })

  it('renders the form when open', () => {
    useCreateIssueEntryDialogStore.setState({ isOpen: true })
    renderDialog()
    expect(screen.getByTestId('issue-entry-form')).toBeInTheDocument()
  })

  it('calls close when dialog is dismissed via Escape', async () => {
    useCreateIssueEntryDialogStore.setState({ isOpen: true })
    renderDialog()
    await userEvent.keyboard('{Escape}')
    expect(useCreateIssueEntryDialogStore.getState().isOpen).toBe(false)
  })
})
