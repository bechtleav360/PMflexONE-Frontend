import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { showError, showSuccess } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { useCreateIssueFromRiskDialogStore } from '../../store/useCreateIssueFromRiskDialogStore'
import { CreateIssueFromRiskDialog } from './CreateIssueFromRiskDialog'

const mockMutateAsync = vi.fn()

vi.mock('../../hooks/useCreateIssueFromRisk', () => ({
  useCreateIssueFromRisk: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
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
      createElement(CreateIssueFromRiskDialog, {
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
  useCreateIssueFromRiskDialogStore.setState({
    isOpen: false,
    sourceRiskId: null,
    sourceRiskName: null,
    sourceRiskVersion: null,
  })
  mockMutateAsync.mockReset()
  mockShowSuccess.mockReset()
  mockShowError.mockReset()
})

describe('CreateIssueFromRiskDialog — rendering', () => {
  it('does not render dialog content when store is closed', () => {
    renderDialog()
    expect(screen.queryByText('Create Issue from Risk')).not.toBeInTheDocument()
  })

  it('renders dialog title when store is open', () => {
    useCreateIssueFromRiskDialogStore.setState({
      isOpen: true,
      sourceRiskId: 'r-1',
      sourceRiskName: 'Budget risk',
      sourceRiskVersion: 3,
    })
    renderDialog()
    expect(screen.getByText('Create Issue from Risk')).toBeInTheDocument()
  })
})

describe('CreateIssueFromRiskDialog — interactions', () => {
  it('calls mutateAsync with riskEntryId and version on confirm', async () => {
    mockMutateAsync.mockResolvedValue({ id: 'i-new' })
    useCreateIssueFromRiskDialogStore.setState({
      isOpen: true,
      sourceRiskId: 'r-1',
      sourceRiskName: 'Budget risk',
      sourceRiskVersion: 3,
    })
    renderDialog()

    await userEvent.click(screen.getByRole('button', { name: /create issue/i }))

    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith({ riskEntryId: 'r-1', version: 3 }),
    )
  })

  it('shows success toast and closes dialog on successful confirm', async () => {
    mockMutateAsync.mockResolvedValue({ id: 'i-new' })
    useCreateIssueFromRiskDialogStore.setState({
      isOpen: true,
      sourceRiskId: 'r-1',
      sourceRiskName: 'Budget risk',
      sourceRiskVersion: 3,
    })
    renderDialog()

    await userEvent.click(screen.getByRole('button', { name: /create issue/i }))

    await waitFor(() => expect(mockShowSuccess).toHaveBeenCalledOnce())
    expect(useCreateIssueFromRiskDialogStore.getState().isOpen).toBe(false)
  })

  it('shows error toast on failed confirm', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Network error'))
    useCreateIssueFromRiskDialogStore.setState({
      isOpen: true,
      sourceRiskId: 'r-1',
      sourceRiskName: 'Budget risk',
      sourceRiskVersion: 3,
    })
    renderDialog()

    await userEvent.click(screen.getByRole('button', { name: /create issue/i }))

    await waitFor(() => expect(mockShowError).toHaveBeenCalledOnce())
  })

  it('calls close when cancel button is clicked', async () => {
    useCreateIssueFromRiskDialogStore.setState({
      isOpen: true,
      sourceRiskId: 'r-1',
      sourceRiskName: 'Budget risk',
      sourceRiskVersion: 3,
    })
    renderDialog()

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(useCreateIssueFromRiskDialogStore.getState().isOpen).toBe(false)
  })

  it('does not call mutateAsync when sourceRiskId is null', async () => {
    useCreateIssueFromRiskDialogStore.setState({
      isOpen: true,
      sourceRiskId: null,
      sourceRiskName: null,
      sourceRiskVersion: null,
    })
    renderDialog()

    await userEvent.click(screen.getByRole('button', { name: /create issue/i }))

    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('does not call mutateAsync when sourceRiskVersion is null', async () => {
    useCreateIssueFromRiskDialogStore.setState({
      isOpen: true,
      sourceRiskId: 'r-1',
      sourceRiskName: 'Budget risk',
      sourceRiskVersion: null,
    })
    renderDialog()

    await userEvent.click(screen.getByRole('button', { name: /create issue/i }))

    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})
