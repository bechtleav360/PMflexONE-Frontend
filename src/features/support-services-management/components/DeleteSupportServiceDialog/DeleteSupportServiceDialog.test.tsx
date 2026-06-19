import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useSupportServicesUiStore } from '../../store/supportServicesUiStore'
import { DeleteSupportServiceDialog } from './DeleteSupportServiceDialog'

const mockMutateAsync = vi.fn().mockResolvedValue(true)

vi.mock('../../hooks/useDeleteSupportService', () => ({
  useDeleteSupportService: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

function Fixture() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(DeleteSupportServiceDialog, { projectId: 'proj1' }),
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('de')
})

// eslint-disable-next-line max-lines-per-function -- test suite with multiple it() blocks
describe('DeleteSupportServiceDialog', () => {
  it('does not render when dialog is closed', () => {
    useSupportServicesUiStore.setState({
      deleteDialog: { open: false, supportServiceId: null, version: null, hasChildren: false },
    })
    render(createElement(Fixture, {}))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders simple delete button when no children', async () => {
    useSupportServicesUiStore.setState({
      deleteDialog: { open: true, supportServiceId: 'ss-1', version: 1, hasChildren: false },
    })

    render(createElement(Fixture, {}))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Single delete button (no cascade warning)
    expect(screen.getByRole('button', { name: /löschen/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /alle löschen/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /hochstufen/i })).not.toBeInTheDocument()
  })

  it('renders "Alle löschen" and "Hochstufen" buttons when has children', async () => {
    useSupportServicesUiStore.setState({
      deleteDialog: { open: true, supportServiceId: 'ss-2', version: 1, hasChildren: true },
    })

    render(createElement(Fixture, {}))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /alle löschen/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hochstufen/i })).toBeInTheDocument()
  })

  it('calls delete mutation with CASCADE_DELETE on "Löschen" click', async () => {
    mockMutateAsync.mockResolvedValue({ deletedDescendantCount: 0 })
    const user = userEvent.setup()

    useSupportServicesUiStore.setState({
      deleteDialog: { open: true, supportServiceId: 'ss-3', version: 2, hasChildren: false },
    })

    render(createElement(Fixture, {}))

    await waitFor(() => screen.getByRole('button', { name: /löschen/i }))
    await user.click(screen.getByRole('button', { name: /löschen/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 'ss-3',
        version: 2,
        deleteMode: 'CASCADE_DELETE',
      })
    })
  })

  it('calls delete mutation with CASCADE_DELETE on "Alle löschen" click', async () => {
    mockMutateAsync.mockResolvedValue({ deletedDescendantCount: 2 })
    const user = userEvent.setup()

    useSupportServicesUiStore.setState({
      deleteDialog: { open: true, supportServiceId: 'ss-4', version: 3, hasChildren: true },
    })

    render(createElement(Fixture, {}))

    await waitFor(() => screen.getByRole('button', { name: /alle löschen/i }))
    await user.click(screen.getByRole('button', { name: /alle löschen/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 'ss-4',
        version: 3,
        deleteMode: 'CASCADE_DELETE',
      })
    })
  })

  it('calls delete mutation with PROMOTE_CHILDREN on "Hochstufen" click', async () => {
    mockMutateAsync.mockResolvedValue({ deletedDescendantCount: 0 })
    const user = userEvent.setup()

    useSupportServicesUiStore.setState({
      deleteDialog: { open: true, supportServiceId: 'ss-5', version: 1, hasChildren: true },
    })

    render(createElement(Fixture, {}))

    await waitFor(() => screen.getByRole('button', { name: /hochstufen/i }))
    await user.click(screen.getByRole('button', { name: /hochstufen/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 'ss-5',
        version: 1,
        deleteMode: 'PROMOTE_CHILDREN',
      })
    })
  })
})
