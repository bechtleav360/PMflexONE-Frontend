import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useStakeholderDialogStore } from '../store/useStakeholderDialogStore'
import { StakeholderDialog } from './StakeholderDialog'

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useBlocker: () => ({ state: 'unblocked', proceed: vi.fn(), reset: vi.fn() }),
  }
})

vi.mock('../hooks/useCreateStakeholder', () => ({
  useCreateStakeholder: () => ({ mutateAsync: vi.fn().mockResolvedValue({}) }),
}))

vi.mock('../hooks/useUpdateStakeholder', () => ({
  useUpdateStakeholder: () => ({ mutateAsync: vi.fn().mockResolvedValue({}) }),
}))

vi.mock('../hooks/useStakeholderDialogActions', () => ({
  useStakeholderDialogActions: () => ({
    handleSave: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock('../hooks/useStakeholderDialogData', () => ({
  useStakeholderDialogData: () => ({
    mode: 'create',
    defaultValues: undefined,
    dialogTitle: 'New stakeholder',
  }),
}))

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useStakeholderDialogStore.setState({ open: false, payload: null })
})

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

function renderDialog() {
  return render(
    createElement(
      makeWrapper(),
      null,
      createElement(StakeholderDialog, { scopeType: 'Project', scopeId: 'proj-1' }),
    ),
  )
}

describe('StakeholderDialog — create mode', () => {
  it('does not render when store is closed', () => {
    renderDialog()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog when store is open with null payload (create mode)', () => {
    useStakeholderDialogStore.setState({ open: true, payload: null })
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes when cancel is clicked', async () => {
    useStakeholderDialogStore.setState({ open: true, payload: null })
    renderDialog()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(useStakeholderDialogStore.getState().open).toBe(false)
  })

  it('shows the dialog title from useStakeholderDialogData', () => {
    useStakeholderDialogStore.setState({ open: true, payload: null })
    renderDialog()

    expect(screen.getByText('New stakeholder')).toBeInTheDocument()
  })
})

describe('StakeholderDialog — dialog content', () => {
  it('shows the dialog title from useStakeholderDialogData', () => {
    useStakeholderDialogStore.setState({ open: true, payload: null })
    renderDialog()

    expect(screen.getByText('New stakeholder')).toBeInTheDocument()
  })

  it('save button is present in the form', () => {
    useStakeholderDialogStore.setState({ open: true, payload: null })
    renderDialog()

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('renders dialog in readOnly mode without crashing', () => {
    useStakeholderDialogStore.setState({ open: true, payload: null })
    render(
      createElement(
        makeWrapper(),
        null,
        createElement(StakeholderDialog, {
          scopeType: 'Project',
          scopeId: 'proj-1',
          readOnly: true,
        }),
      ),
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
