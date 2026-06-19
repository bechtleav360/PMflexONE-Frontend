import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useCreateRiskEntryDialogStore } from '../../store/useCreateRiskEntryDialogStore'
import { CreateRiskEntryDialog } from './CreateRiskEntryDialog'

vi.mock('./CreateRiskEntryForm', () => ({
  CreateRiskEntryForm: () => createElement('div', { 'data-testid': 'risk-entry-form' }),
}))

let queryClient: QueryClient

function renderDialog() {
  return render(
    createElement(CreateRiskEntryDialog, {
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
  useCreateRiskEntryDialogStore.setState({ isOpen: false })
})

describe('CreateRiskEntryDialog', () => {
  it('does not render dialog content when store is closed', () => {
    renderDialog()
    expect(screen.queryByText('New Risk / Opportunity')).not.toBeInTheDocument()
  })

  it('renders dialog title when store is open', () => {
    useCreateRiskEntryDialogStore.setState({ isOpen: true })
    renderDialog()
    expect(screen.getByText('New Risk / Opportunity')).toBeInTheDocument()
  })

  it('renders the form when open', () => {
    useCreateRiskEntryDialogStore.setState({ isOpen: true })
    renderDialog()
    expect(screen.getByTestId('risk-entry-form')).toBeInTheDocument()
  })

  it('calls close when dialog is dismissed via Escape', async () => {
    useCreateRiskEntryDialogStore.setState({ isOpen: true })
    renderDialog()
    await userEvent.keyboard('{Escape}')
    expect(useCreateRiskEntryDialogStore.getState().isOpen).toBe(false)
  })
})
