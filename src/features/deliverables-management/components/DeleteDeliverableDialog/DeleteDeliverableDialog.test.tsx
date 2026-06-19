import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useDeleteDeliverable } from '../../hooks/useDeleteDeliverable'
import { useDeliverableTree } from '../../hooks/useDeliverables'
import { useDeliverablesUiStore } from '../../store/deliverablesUiStore'
import { DeleteDeliverableDialog } from './DeleteDeliverableDialog'

vi.mock('../../hooks/useDeleteDeliverable')
vi.mock('../../hooks/useDeliverables')

const mockUseDeleteDeliverable = vi.mocked(useDeleteDeliverable)
const mockUseDeliverableTree = vi.mocked(useDeliverableTree)

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return Wrapper
}

function renderDialog(projectId = 'proj-1') {
  const Wrapper = makeWrapper()
  render(
    <Wrapper>
      <DeleteDeliverableDialog projectId={projectId} />
    </Wrapper>,
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useDeliverablesUiStore.setState({
    deleteDialog: { open: false, deliverableId: null, version: null },
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial mock of hook return type; full type requires all TanStack Query fields
  mockUseDeliverableTree.mockReturnValue({ data: { tree: [] }, isPending: false } as any)
  mockUseDeleteDeliverable.mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({ deletedDescendantCount: 0 }),
    isPending: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial mock of hook return type; full type requires all TanStack Query fields
  } as any)
})

describe('DeleteDeliverableDialog — closed state', () => {
  it('does not render a dialog when closed', () => {
    renderDialog()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('DeleteDeliverableDialog — open, no descendants', () => {
  beforeEach(() => {
    useDeliverablesUiStore.setState({
      deleteDialog: { open: true, deliverableId: 'del-1', version: 1 },
    })
  })

  it('renders the dialog title', () => {
    renderDialog()
    expect(screen.getByRole('heading', { name: /delete deliverable/i })).toBeInTheDocument()
  })

  it('shows "Delete" (not "Delete all") when there are no descendants', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete all/i })).not.toBeInTheDocument()
  })

  it('does not show the cascade warning when there are no descendants', () => {
    renderDialog()
    expect(screen.queryByText(/subordinate/i)).not.toBeInTheDocument()
  })

  it('closes the dialog when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(useDeliverablesUiStore.getState().deleteDialog.open).toBe(false)
  })

  it('calls mutateAsync and closes dialog when Delete is clicked', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ deletedDescendantCount: 0 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial mock of hook return type; full type requires all TanStack Query fields
    mockUseDeleteDeliverable.mockReturnValue({ mutateAsync, isPending: false } as any)
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /^delete$/i }))
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ id: 'del-1', version: 1 }))
    expect(useDeliverablesUiStore.getState().deleteDialog.open).toBe(false)
  })
})

describe('DeleteDeliverableDialog — open, with descendants', () => {
  beforeEach(() => {
    useDeliverablesUiStore.setState({
      deleteDialog: { open: true, deliverableId: 'del-1', version: 1 },
    })
    mockUseDeliverableTree.mockReturnValue({
      data: {
        tree: [
          {
            id: 'del-1',
            name: 'Root',
            businessId: 'D-1',
            version: 1,
            description: null,
            otherInformation: null,
            owner: null,
            parent: null,
            createdAt: '',
            updatedAt: '',
            childNodes: [
              {
                id: 'del-2',
                name: 'Child',
                businessId: 'D-2',
                version: 1,
                description: null,
                otherInformation: null,
                owner: null,
                parent: null,
                createdAt: '',
                updatedAt: '',
                childNodes: [],
              },
            ],
          },
        ],
      },
      isPending: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial mock of hook return type; full type requires all TanStack Query fields
    } as any)
  })

  it('shows the cascade warning alert', () => {
    renderDialog()
    expect(screen.getByText(/subordinate/i)).toBeInTheDocument()
  })

  it('shows "Delete all" button instead of "Delete"', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: /delete all/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument()
  })
})
