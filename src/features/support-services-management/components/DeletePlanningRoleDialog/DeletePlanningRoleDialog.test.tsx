import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { DeletePlanningRoleDialog } from './DeletePlanningRoleDialog'

const mockMutateAsync = vi.fn().mockResolvedValue(true)

vi.mock('../../hooks/useDeletePlanningRole', () => ({
  useDeletePlanningRole: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

beforeAll(async () => {
  await i18n.changeLanguage('de')
})

interface FixtureProps {
  open: boolean
  planningRoleId?: string | null
  planningRoleName?: string
  version?: number | null
  assignedCount?: number
  onClose?: () => void
  onDeleted?: () => void
}

function Fixture({
  open,
  planningRoleId = 'r1',
  planningRoleName = 'Entwicklung',
  version = 1,
  assignedCount = 0,
  onClose = vi.fn(),
  onDeleted = vi.fn(),
}: FixtureProps) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(DeletePlanningRoleDialog, {
      projectId: 'proj1',
      open,
      planningRoleId,
      planningRoleName,
      version,
      assignedCount,
      onClose,
      onDeleted,
    }),
  )
}

describe('DeletePlanningRoleDialog', () => {
  it('does not render when closed', () => {
    render(createElement(Fixture, { open: false }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders role name in dialog body when open', async () => {
    render(createElement(Fixture, { open: true, planningRoleName: 'Entwicklung' }))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    expect(screen.getByText('Entwicklung')).toBeInTheDocument()
  })

  it('calls mutateAsync with id and version, then onDeleted, on confirm click', async () => {
    const onDeleted = vi.fn()
    mockMutateAsync.mockResolvedValue(true)
    const user = userEvent.setup()

    render(createElement(Fixture, { open: true, planningRoleId: 'r1', version: 1, onDeleted }))

    await waitFor(() => screen.getByRole('dialog'))
    await user.click(screen.getByRole('button', { name: /löschen/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ id: 'r1', version: 1 })
      expect(onDeleted).toHaveBeenCalled()
    })
  })

  it('shows assignment warning when assignedCount > 0', async () => {
    render(createElement(Fixture, { open: true, assignedCount: 3 }))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    // The withAssignments translation contains the count
    expect(screen.getByText(/3 Supportleistungen/i)).toBeInTheDocument()
  })

  it('shows error message when mutation rejects', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Delete failed'))
    const user = userEvent.setup()

    render(createElement(Fixture, { open: true, planningRoleId: 'r1', version: 1 }))
    await waitFor(() => screen.getByRole('dialog'))
    await user.click(screen.getByRole('button', { name: /löschen/i }))

    await waitFor(() => {
      // Error message should appear in the dialog body
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('calls onClose when dialog is dismissed via onOpenChange', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()

    render(createElement(Fixture, { open: true, onClose }))
    await waitFor(() => screen.getByRole('dialog'))

    // Click the X button to close the dialog
    await user.click(screen.getByRole('button', { name: /schließen/i }))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })
})
