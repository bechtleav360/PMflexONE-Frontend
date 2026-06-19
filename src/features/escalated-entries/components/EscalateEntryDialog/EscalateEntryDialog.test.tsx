import { createElement } from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'
import { makeQueryWrapper } from '@/shared/test-utils/makeQueryWrapper'

import { useEscalateEntryDialogStore } from '../../store/useEscalateEntryDialogStore'
import { EscalateEntryDialog } from './EscalateEntryDialog'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
  setGraphqlLanguage: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const mockMutate = vi.fn()
let mockIsPending = false

vi.mock('../../hooks/useCreateEscalatedEntry', () => ({
  useCreateEscalatedEntry: () => ({
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
  useEscalateEntryDialogStore.setState({
    isOpen: false,
    sourceEntryId: null,
    sourceEntryType: null,
    version: null,
  })
})

describe('EscalateEntryDialog — visibility', () => {
  it('renders nothing when dialog store is closed', () => {
    render(createElement(EscalateEntryDialog), { wrapper: makeQueryWrapper() })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders dialog when store is open', async () => {
    useEscalateEntryDialogStore.setState({
      isOpen: true,
      sourceEntryId: 'r-1',
      sourceEntryType: 'RISK',
      version: 1,
    })
    render(createElement(EscalateEntryDialog), { wrapper: makeQueryWrapper() })
    expect(screen.getByRole('dialog')).toBeDefined()
  })

  it('shows loading state while mutation is pending', () => {
    mockIsPending = true
    useEscalateEntryDialogStore.setState({
      isOpen: true,
      sourceEntryId: 'r-1',
      sourceEntryType: 'RISK',
      version: 1,
    })
    render(createElement(EscalateEntryDialog), { wrapper: makeQueryWrapper() })
    const submitBtn = screen.getByRole('button', { name: /escalate/i })
    expect(submitBtn).toHaveAttribute('disabled')
  })
})

describe('EscalateEntryDialog — form submission', () => {
  it('blocks submit when reason is empty', async () => {
    useEscalateEntryDialogStore.setState({
      isOpen: true,
      sourceEntryId: 'r-1',
      sourceEntryType: 'RISK',
      version: 1,
    })
    const user = userEvent.setup()
    render(createElement(EscalateEntryDialog), { wrapper: makeQueryWrapper() })

    const submitBtn = screen.getByRole('button', { name: /escalate/i })
    await user.click(submitBtn)

    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('calls mutate with reason when form is submitted', async () => {
    useEscalateEntryDialogStore.setState({
      isOpen: true,
      sourceEntryId: 'r-1',
      sourceEntryType: 'RISK',
      version: 1,
    })
    const user = userEvent.setup()
    render(createElement(EscalateEntryDialog), { wrapper: makeQueryWrapper() })

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Critical budget overrun requires escalation')

    const submitBtn = screen.getByRole('button', { name: /escalate/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceEntryId: 'r-1',
          sourceEntryType: 'RISK',
          reason: 'Critical budget overrun requires escalation',
        }),
        expect.anything(),
      )
    })
  })

  it('does not call mutate when sourceEntryId is null (guard branch)', async () => {
    useEscalateEntryDialogStore.setState({
      isOpen: true,
      sourceEntryId: null,
      sourceEntryType: 'RISK',
      version: 1,
    })
    const user = userEvent.setup()
    render(createElement(EscalateEntryDialog), { wrapper: makeQueryWrapper() })

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Some reason')

    const submitBtn = screen.getByRole('button', { name: /escalate/i })
    await user.click(submitBtn)

    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('does not call mutate when sourceEntryType is null (guard branch)', async () => {
    useEscalateEntryDialogStore.setState({
      isOpen: true,
      sourceEntryId: 'r-1',
      sourceEntryType: null,
      version: 1,
    })
    const user = userEvent.setup()
    render(createElement(EscalateEntryDialog), { wrapper: makeQueryWrapper() })

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Some reason')

    const submitBtn = screen.getByRole('button', { name: /escalate/i })
    await user.click(submitBtn)

    expect(mockMutate).not.toHaveBeenCalled()
  })
})
