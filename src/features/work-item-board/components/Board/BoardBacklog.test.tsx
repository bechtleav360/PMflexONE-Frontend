import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type { ProjectWorkItem } from '@/entities/work-item'
import { TooltipProvider } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { BoardBacklog } from './BoardBacklog'

// dnd-kit needs to be mocked as jsdom does not support drag-and-drop APIs
vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => children,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}))

function makeWorkItem(
  overrides: Partial<ProjectWorkItem> & { id: string; name: string },
): ProjectWorkItem {
  return {
    version: 1,
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
    ...overrides,
  }
}

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

const WI_HIGH = makeWorkItem({ id: 'a', name: 'High task', priority: 'HIGH' })
const WI_LOW = makeWorkItem({ id: 'b', name: 'Low task', priority: 'LOW' })

function renderBacklog(
  groups: { key: string; items: ProjectWorkItem[] }[],
  allItems: ProjectWorkItem[] = [],
  onSelect?: (id: string) => void,
) {
  const Wrapper = makeWrapper()
  return render(
    createElement(
      Wrapper,
      null,
      createElement(BoardBacklog, { groups, allItems, dragOverId: null, onSelect }),
    ),
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('BoardBacklog', () => {
  it('renders the heading', () => {
    renderBacklog([])
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
  })

  it('shows empty state message when there are no groups', () => {
    renderBacklog([])
    expect(screen.getByText(/no unassigned/i)).toBeInTheDocument()
  })

  it('renders items grouped by priority key', () => {
    const groups = [
      { key: 'high', items: [WI_HIGH] },
      { key: 'low', items: [WI_LOW] },
    ]
    renderBacklog(groups, [WI_HIGH, WI_LOW])
    expect(screen.getByText('High task')).toBeInTheDocument()
    expect(screen.getByText('Low task')).toBeInTheDocument()
  })

  it('renders the priority group label', () => {
    const groups = [{ key: 'high', items: [WI_HIGH] }]
    renderBacklog(groups, [WI_HIGH])
    // priority label may appear multiple times (group heading + card badge)
    expect(screen.getAllByText(/high/i).length).toBeGreaterThan(0)
  })
})
