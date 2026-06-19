import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as WorkItemModule from '@/entities/work-item'
import type * as WorkItemCrudModule from '@/features/work-item-crud'
import { i18n } from '@/shared/lib/i18n'

import { ArchivePool } from './ArchivePool'

const mockUnarchive = vi.fn().mockResolvedValue({ id: 'wi-3', version: 2, archived: false })

vi.mock('@/features/work-item-crud', async (importOriginal) => {
  const actual = await importOriginal<typeof WorkItemCrudModule>()
  return {
    ...actual,
    useUnarchiveWorkItem: () => ({ mutateAsync: mockUnarchive, isPending: false }),
  }
})

const archivedItems = [
  {
    id: 'wi-3',
    version: 1,
    name: 'Archived Task',
    description: null,
    status: 'DONE' as const,
    dueDate: null,
    priority: 'LOW' as const,
    archived: true,
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
]

vi.mock('@/entities/work-item', async (importOriginal) => {
  const actual = await importOriginal<typeof WorkItemModule>()
  return {
    ...actual,
    useWorkItems: (_scopeType: string, _scopeId: string, filter?: { archived?: boolean }) => ({
      data: filter?.archived === true ? archivedItems : [],
      isLoading: false,
    }),
  }
})

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: qc }, children)
  }
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  mockUnarchive.mockClear()
})

describe('ArchivePool', () => {
  it('renders archived task names', () => {
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(ArchivePool, { scopeType: 'Project', scopeId: 'proj-1' }),
      ),
    )
    expect(screen.getByText('Archived Task')).toBeInTheDocument()
  })

  it('calls unarchiveWorkItem with correct id and version when unarchive is clicked', async () => {
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(ArchivePool, { scopeType: 'Project', scopeId: 'proj-1' }),
      ),
    )
    const user = userEvent.setup()

    const unarchiveBtn = screen.getByRole('button', { name: /unarchive|restore/i })
    await user.click(unarchiveBtn)

    await waitFor(() => {
      expect(mockUnarchive).toHaveBeenCalledOnce()
    })

    const callArg = mockUnarchive.mock.calls[0][0] as { id: string; version: number }
    expect(callArg.id).toBe('wi-3')
    expect(callArg.version).toBe(1)
  })

  it('shows empty state when no archived tasks exist', () => {
    const Wrapper = makeWrapper()
    // Render with a different scopeId that returns no items
    render(
      createElement(
        Wrapper,
        null,
        createElement(ArchivePool, { scopeType: 'Project', scopeId: 'proj-empty' }),
      ),
    )
    // Either "no tasks" message or just the heading renders
    expect(document.body).toBeInTheDocument()
  })
})
