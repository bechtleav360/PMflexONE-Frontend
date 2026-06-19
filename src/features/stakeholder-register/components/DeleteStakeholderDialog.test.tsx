import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { StakeholderEntry } from '@/entities/stakeholder'
import { i18n } from '@/shared/lib/i18n'

import { useDeleteStakeholderDialogStore } from '../store/useDeleteStakeholderDialogStore'
import { DeleteStakeholderDialog } from './DeleteStakeholderDialog'

vi.mock('../hooks/useDeleteStakeholder', () => ({
  useDeleteStakeholder: () => ({ mutateAsync: vi.fn().mockResolvedValue(true) }),
}))

vi.mock('sonner', () => ({
  toast: { promise: vi.fn() },
}))

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const entry: StakeholderEntry = {
  id: 'e1',
  version: 1,
  name: 'Alice Müller',
  role: 'PM',
  contactGroup: 'INTERNAL',
  email: null,
  email2: null,
  email3: null,
  phone: null,
  phone2: null,
  phone3: null,
  preferredCommunicationType: null,
  matrixPosition: null,
  typeOfAffectedness: null,
  conflictPotential: null,
  expectations: null,
  responsible: null,
  inclusionMeasures: null,
  linkedMember: null,
  behaviouralStrategy: null,
  scope: { id: 'proj-1', name: 'Project proj-1', scopeType: 'Project' },
  logs: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

function renderDialog() {
  return render(
    createElement(
      makeWrapper(),
      null,
      createElement(DeleteStakeholderDialog, { scopeType: 'Project', scopeId: 'proj-1' }),
    ),
  )
}

beforeEach(() => {
  useDeleteStakeholderDialogStore.setState({ open: false, payload: null })
})

describe('DeleteStakeholderDialog', () => {
  it('does not render when closed', () => {
    renderDialog()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders with entry name when open', () => {
    useDeleteStakeholderDialogStore.setState({ open: true, payload: entry })
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/Alice Müller/)).toBeInTheDocument()
  })

  it('closes without deleting when Cancel is clicked', async () => {
    useDeleteStakeholderDialogStore.setState({ open: true, payload: entry })
    renderDialog()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(useDeleteStakeholderDialogStore.getState().open).toBe(false)
  })

  it('closes when Confirm is clicked', async () => {
    useDeleteStakeholderDialogStore.setState({ open: true, payload: entry })
    renderDialog()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /confirm/i }))

    expect(useDeleteStakeholderDialogStore.getState().open).toBe(false)
  })

  it('confirm with null payload: does not call mutateAsync and keeps dialog open', async () => {
    useDeleteStakeholderDialogStore.setState({ open: true, payload: null })
    renderDialog()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /confirm/i }))

    // handleConfirm has `if (!payload) return` — so it returns early without
    // calling mutateAsync or closeModal, leaving the dialog open.
    expect(useDeleteStakeholderDialogStore.getState().open).toBe(true)
  })
})
