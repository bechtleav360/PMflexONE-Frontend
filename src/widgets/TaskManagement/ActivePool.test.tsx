import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as WorkItemModule from '@/entities/work-item'
import type * as WorkItemCrudModule from '@/features/work-item-crud'
import { TooltipProvider } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { ActivePool } from './ActivePool'

const mockArchive = vi.fn().mockResolvedValue({ id: 'wi-1', version: 2, archived: true })

vi.mock('@/features/work-item-crud', async (importOriginal) => {
  const actual = await importOriginal<typeof WorkItemCrudModule>()
  return {
    ...actual,
    useArchiveWorkItem: () => ({ mutateAsync: mockArchive, isPending: false }),
    useCreateWorkItemDialogStore: Object.assign(
      () => ({ open: false, openModal: vi.fn(), closeModal: vi.fn() }),
      {
        getState: () => ({ open: false, openModal: vi.fn(), closeModal: vi.fn() }),
        setState: vi.fn(),
      },
    ),
    useEditWorkItemDialogStore: Object.assign(
      () => ({ open: false, payload: null, openModal: vi.fn(), closeModal: vi.fn() }),
      {
        getState: () => ({ open: false, payload: null, openModal: vi.fn(), closeModal: vi.fn() }),
        setState: vi.fn(),
      },
    ),
  }
})

const poolItems = [
  {
    id: 'wi-1',
    version: 1,
    name: 'Pool Task One',
    description: null,
    status: 'OPEN' as const,
    dueDate: null,
    priority: null,
    archived: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    metadata: null,
    creator: null,
    updater: null,
    assignee: null,
    boardColumn: null,
    labels: [],
    scope: null,
  },
  {
    id: 'wi-2',
    version: 1,
    name: 'Board Assigned Task',
    description: null,
    status: 'IN_PROGRESS' as const,
    dueDate: null,
    priority: null,
    archived: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    metadata: null,
    creator: null,
    updater: null,
    assignee: null,
    boardColumn: {
      id: 'col-1',
      version: 1,
      name: 'Open',
      workItemStatus: 'OPEN',
      position: 0,
      board: { id: 'board-1', name: 'Sprint' },
    },
    labels: [],
    scope: null,
  },
]

vi.mock('@/entities/work-item', async (importOriginal) => {
  const actual = await importOriginal<typeof WorkItemModule>()
  return {
    ...actual,
    useWorkItems: () => ({ data: poolItems, isLoading: false }),
  }
})

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: qc },
      createElement(TooltipProvider, null, children),
    )
  }
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  mockArchive.mockClear()
})

describe('ActivePool', () => {
  it('renders only unassigned (non-board) tasks', () => {
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(ActivePool, {
          scopeType: 'Project',
          scopeId: 'proj-1',
          assignedWorkItemIds: new Set(['wi-2']),
        }),
      ),
    )
    expect(screen.getByText('Pool Task One')).toBeInTheDocument()
    expect(screen.queryByText('Board Assigned Task')).not.toBeInTheDocument()
  })

  it('calls archiveWorkItem with correct id and version when archive is clicked', async () => {
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(ActivePool, {
          scopeType: 'Project',
          scopeId: 'proj-1',
          assignedWorkItemIds: new Set(['wi-2']),
        }),
      ),
    )
    const user = userEvent.setup()

    const archiveBtn = screen.getByRole('button', { name: /archive task pool task one/i })
    await user.click(archiveBtn)

    // ConfirmDialog opens — click the confirm button inside it
    const confirmBtn = await screen.findByRole('button', { name: /^archive$/i })
    await user.click(confirmBtn)

    await waitFor(() => {
      expect(mockArchive).toHaveBeenCalledOnce()
    })

    const callArg = mockArchive.mock.calls[0][0] as { id: string; version: number }
    expect(callArg.id).toBe('wi-1')
    expect(callArg.version).toBe(1)
  })

  it('renders a "Create task" button', () => {
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(ActivePool, { scopeType: 'Project', scopeId: 'proj-1' }),
      ),
    )
    expect(screen.getByRole('button', { name: /create|new task/i })).toBeInTheDocument()
  })
})
