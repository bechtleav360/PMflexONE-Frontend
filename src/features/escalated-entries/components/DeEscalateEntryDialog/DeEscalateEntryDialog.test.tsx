import { createElement } from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'
import { makeQueryWrapper } from '@/shared/test-utils/makeQueryWrapper'

import { useDeEscalateEntryDialogStore } from '../../store/useDeEscalateEntryDialogStore'
import { DeEscalateEntryDialog } from './DeEscalateEntryDialog'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
  setGraphqlLanguage: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const mockMutate = vi.fn()
let mockIsPending = false

vi.mock('../../hooks/useDeEscalateEntry', () => ({
  useDeEscalateEntry: () => ({
    mutate: mockMutate,
    get isPending() {
      return mockIsPending
    },
    isSuccess: false,
  }),
}))

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  mockMutate.mockReset()
  mockIsPending = false
  useDeEscalateEntryDialogStore.setState({
    isOpen: false,
    escalatedEntryId: null,
    version: null,
  })
})

describe('DeEscalateEntryDialog — visibility', () => {
  it('renders nothing when dialog store is closed', () => {
    render(createElement(DeEscalateEntryDialog), { wrapper: makeQueryWrapper() })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders dialog when store is open', async () => {
    useDeEscalateEntryDialogStore.setState({
      isOpen: true,
      escalatedEntryId: 'ee-1',
      version: 2,
    })
    render(createElement(DeEscalateEntryDialog), { wrapper: makeQueryWrapper() })
    expect(screen.getByRole('dialog')).toBeDefined()
  })

  it('shows loading state while mutation is pending', () => {
    mockIsPending = true
    useDeEscalateEntryDialogStore.setState({
      isOpen: true,
      escalatedEntryId: 'ee-1',
      version: 2,
    })
    render(createElement(DeEscalateEntryDialog), { wrapper: makeQueryWrapper() })
    const submitBtn = screen.getByRole('button', { name: /return/i })
    expect(submitBtn).toHaveAttribute('disabled')
  })

  it('closes dialog and calls close store action on cancel', async () => {
    useDeEscalateEntryDialogStore.setState({
      isOpen: true,
      escalatedEntryId: 'ee-1',
      version: 2,
    })
    const user = userEvent.setup()
    render(createElement(DeEscalateEntryDialog), { wrapper: makeQueryWrapper() })

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    await waitFor(() => {
      expect(useDeEscalateEntryDialogStore.getState().isOpen).toBe(false)
    })
  })
})

describe('DeEscalateEntryDialog — form submission', () => {
  it('blocks submit when reason is empty', async () => {
    useDeEscalateEntryDialogStore.setState({
      isOpen: true,
      escalatedEntryId: 'ee-1',
      version: 2,
    })
    const user = userEvent.setup()
    render(createElement(DeEscalateEntryDialog), { wrapper: makeQueryWrapper() })

    const submitBtn = screen.getByRole('button', { name: /return/i })
    await user.click(submitBtn)

    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('calls mutate with id, version, and reason when submitted', async () => {
    useDeEscalateEntryDialogStore.setState({
      isOpen: true,
      escalatedEntryId: 'ee-1',
      version: 2,
    })
    const user = userEvent.setup()
    render(createElement(DeEscalateEntryDialog), { wrapper: makeQueryWrapper() })

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Risk has been mitigated at project level')

    const submitBtn = screen.getByRole('button', { name: /return/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'ee-1',
          version: 2,
          reason: 'Risk has been mitigated at project level',
        }),
        expect.anything(),
      )
    })
  })

  it('does not call mutate when escalatedEntryId is null (guard branch)', async () => {
    useDeEscalateEntryDialogStore.setState({
      isOpen: true,
      escalatedEntryId: null,
      version: 1,
    })
    const user = userEvent.setup()
    render(createElement(DeEscalateEntryDialog), { wrapper: makeQueryWrapper() })

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Some reason')

    const submitBtn = screen.getByRole('button', { name: /return/i })
    await user.click(submitBtn)

    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('does not call mutate when version is null (guard branch)', async () => {
    useDeEscalateEntryDialogStore.setState({
      isOpen: true,
      escalatedEntryId: 'ee-1',
      version: null,
    })
    const user = userEvent.setup()
    render(createElement(DeEscalateEntryDialog), { wrapper: makeQueryWrapper() })

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Some reason')

    const submitBtn = screen.getByRole('button', { name: /return/i })
    await user.click(submitBtn)

    expect(mockMutate).not.toHaveBeenCalled()
  })
})
