import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { showError, showSuccess } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { useCreateProblemFromIssueDialogStore } from '../../store/useCreateProblemFromIssueDialogStore'
import { CreateProblemFromIssueDialog } from './CreateProblemFromIssueDialog'

const mockMutateAsync = vi.fn()

vi.mock('../../hooks/useCreateProblemFromIssue', () => ({
  useCreateProblemFromIssue: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponents>()
  return { ...actual, showSuccess: vi.fn(), showError: vi.fn() }
})

const mockShowSuccess = vi.mocked(showSuccess)
const mockShowError = vi.mocked(showError)

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

function renderDialog() {
  const Wrapper = makeWrapper()
  return render(
    createElement(
      Wrapper,
      null,
      createElement(CreateProblemFromIssueDialog, {
        scopeType: 'Project',
        scopeId: 'e2e00000-0000-0000-0000-000000000001',
      }),
    ),
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useCreateProblemFromIssueDialogStore.setState({
    isOpen: false,
    sourceIssueId: null,
    sourceIssueName: null,
    sourceIssueVersion: null,
  })
  mockMutateAsync.mockReset()
  mockShowSuccess.mockReset()
  mockShowError.mockReset()
})

describe('CreateProblemFromIssueDialog — rendering', () => {
  it('does not render dialog content when store is closed', () => {
    renderDialog()
    expect(screen.queryByText('Create Problem from Issue')).not.toBeInTheDocument()
  })

  it('renders dialog title when store is open', () => {
    useCreateProblemFromIssueDialogStore.setState({
      isOpen: true,
      sourceIssueId: 'i-1',
      sourceIssueName: 'Server outage',
      sourceIssueVersion: 2,
    })
    renderDialog()
    expect(screen.getByText('Create Problem from Issue')).toBeInTheDocument()
  })
})

describe('CreateProblemFromIssueDialog — interactions', () => {
  it('calls mutateAsync with issueEntryId and version on confirm', async () => {
    mockMutateAsync.mockResolvedValue({ id: 'p-new' })
    useCreateProblemFromIssueDialogStore.setState({
      isOpen: true,
      sourceIssueId: 'i-1',
      sourceIssueName: 'Server outage',
      sourceIssueVersion: 2,
    })
    renderDialog()

    await userEvent.click(screen.getByRole('button', { name: /create problem/i }))

    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith({ issueEntryId: 'i-1', version: 2 }),
    )
  })

  it('shows success toast and closes dialog on successful confirm', async () => {
    mockMutateAsync.mockResolvedValue({ id: 'p-new' })
    useCreateProblemFromIssueDialogStore.setState({
      isOpen: true,
      sourceIssueId: 'i-1',
      sourceIssueName: 'Server outage',
      sourceIssueVersion: 2,
    })
    renderDialog()

    await userEvent.click(screen.getByRole('button', { name: /create problem/i }))

    await waitFor(() => expect(mockShowSuccess).toHaveBeenCalledOnce())
    expect(useCreateProblemFromIssueDialogStore.getState().isOpen).toBe(false)
  })

  it('shows error toast on failed confirm', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Network error'))
    useCreateProblemFromIssueDialogStore.setState({
      isOpen: true,
      sourceIssueId: 'i-1',
      sourceIssueName: 'Server outage',
      sourceIssueVersion: 2,
    })
    renderDialog()

    await userEvent.click(screen.getByRole('button', { name: /create problem/i }))

    await waitFor(() => expect(mockShowError).toHaveBeenCalledOnce())
  })

  it('calls close when cancel button is clicked', async () => {
    useCreateProblemFromIssueDialogStore.setState({
      isOpen: true,
      sourceIssueId: 'i-1',
      sourceIssueName: 'Server outage',
      sourceIssueVersion: 2,
    })
    renderDialog()

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(useCreateProblemFromIssueDialogStore.getState().isOpen).toBe(false)
  })

  it('does not call mutateAsync when sourceIssueId is null', async () => {
    useCreateProblemFromIssueDialogStore.setState({
      isOpen: true,
      sourceIssueId: null,
      sourceIssueName: null,
      sourceIssueVersion: null,
    })
    renderDialog()

    await userEvent.click(screen.getByRole('button', { name: /create problem/i }))

    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('does not call mutateAsync when sourceIssueVersion is null', async () => {
    useCreateProblemFromIssueDialogStore.setState({
      isOpen: true,
      sourceIssueId: 'i-1',
      sourceIssueName: 'Server outage',
      sourceIssueVersion: null,
    })
    renderDialog()

    await userEvent.click(screen.getByRole('button', { name: /create problem/i }))

    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})
