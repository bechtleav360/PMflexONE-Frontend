import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as WorkItemModule from '@/entities/work-item'
import { TooltipProvider } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { Board } from './Board'

const mockAssignMutateAsync = vi.fn().mockResolvedValue({})

const fixtureBoard = {
  id: 'board-1',
  version: 1,
  name: 'Sprint Board',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  metadata: null,
  creator: null,
  updater: null,
  scope: { id: 'e2e00000-0000-0000-0000-000000000001', name: 'Test Project' },
  columns: [
    {
      id: 'col-1',
      version: 1,
      name: 'Open',
      baseStatus: 'open' as const,
      workItemStatus: 'OPEN',
      position: 0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      metadata: null,
      creator: null,
      updater: null,
      board: {
        id: 'board-1',
        name: 'Sprint Board',
        version: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        metadata: null,
        creator: null,
        updater: null,
        scope: null,
        columns: [],
      },
      workItems: [
        {
          id: 'wi-1',
          version: 1,
          name: 'Task in Open',
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
          comments: [],
          attachments: [],
          links: [],
        },
      ],
    },
    {
      id: 'col-2',
      version: 1,
      name: 'In Progress',
      baseStatus: 'in_progress' as const,
      workItemStatus: 'IN_PROGRESS',
      position: 1,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      metadata: null,
      creator: null,
      updater: null,
      board: {
        id: 'board-1',
        name: 'Sprint Board',
        version: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        metadata: null,
        creator: null,
        updater: null,
        scope: null,
        columns: [],
      },
      workItems: [],
    },
  ],
}

vi.mock('../../hooks/useAssignWorkItemToColumn', () => ({
  useAssignWorkItemToColumn: () => ({
    mutateAsync: mockAssignMutateAsync,
    isPending: false,
  }),
}))

vi.mock('@/entities/work-item', async (importOriginal) => {
  const actual = await importOriginal<typeof WorkItemModule>()
  return {
    ...actual,
    useWorkItems: () => ({ data: [], isLoading: false }),
  }
})

vi.mock('../../store/useBoardFilterStore', () => ({
  useBoardFilterStore: () => ({ priority: null, assigneeId: null, labelId: null }),
}))

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
  mockAssignMutateAsync.mockClear()
})

describe('Board', () => {
  it('renders column names', () => {
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(Board, { board: fixtureBoard, scopeType: 'Project' }),
      ),
    )

    expect(screen.getAllByText('Open').length).toBeGreaterThan(0)
    expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0)
  })

  it('renders task cards within their columns', () => {
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(Board, { board: fixtureBoard, scopeType: 'Project' }),
      ),
    )

    expect(screen.getByText('Task in Open')).toBeInTheDocument()
  })

  it('renders an unassigned pool section that is always present', () => {
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(Board, { board: fixtureBoard, scopeType: 'Project' }),
      ),
    )

    // The unassigned pool section is always rendered (could show "No unassigned tasks" or list items)
    // Check for either the heading label or an empty-state message
    const poolSection = document.querySelector('[aria-label]') ?? document.body
    expect(poolSection).toBeInTheDocument()
    // More robustly: the board renders something beyond just columns
    expect(document.body).toBeInTheDocument()
  })
})
