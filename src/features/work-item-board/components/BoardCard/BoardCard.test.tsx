import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ProjectWorkItem } from '@/entities/work-item'
import { TooltipProvider } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { BoardCard } from './BoardCard'

vi.mock('@dnd-kit/sortable', () => ({
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

const WORK_ITEM: ProjectWorkItem = {
  id: 'wi-1',
  version: 1,
  name: 'Fix login bug',
  description: null,
  status: 'OPEN' as const,
  dueDate: null,
  priority: 'HIGH' as const,
  archived: false,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  metadata: null,
  creator: null,
  updater: null,
  boardColumn: null,
  comments: [],
  attachments: [],
  links: [],
  scope: null,
  assignee: null,
  labels: [],
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(TooltipProvider, null, children),
    )
  }
  return Wrapper
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  // no shared mocks to reset
})

function renderCard(overrides: Partial<ProjectWorkItem> = {}, onSelect?: (id: string) => void) {
  const Wrapper = makeWrapper()
  render(
    createElement(
      Wrapper,
      null,
      createElement(BoardCard, { workItem: { ...WORK_ITEM, ...overrides }, onSelect }),
    ),
  )
}

describe('BoardCard — rendering', () => {
  it('renders the work item name', () => {
    renderCard()
    expect(screen.getByText('Fix login bug')).toBeInTheDocument()
  })

  it('renders the card with the work item content', () => {
    renderCard()
    expect(screen.getByText('Fix login bug')).toBeInTheDocument()
  })

  it('renders the priority label when priority is set', () => {
    renderCard()
    expect(screen.getByText(/high/i)).toBeInTheDocument()
  })

  it('does not render priority span when priority is null', () => {
    renderCard({ priority: null })
    expect(screen.queryByText(/high/i)).not.toBeInTheDocument()
  })

  it('renders label badges when the work item has labels', () => {
    renderCard({
      labels: [
        {
          id: 'label-1',
          name: 'Bug',
          color: '#C0003C',
          version: 1,
        },
      ],
    })
    expect(screen.getByText('Bug')).toBeInTheDocument()
  })
})

describe('BoardCard — interaction', () => {
  it('calls onSelect with the work item id when clicked', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    renderCard({}, onSelect)
    await user.click(screen.getByRole('button', { name: 'Fix login bug' }))
    expect(onSelect).toHaveBeenCalledWith('wi-1')
  })

  it('calls onSelect when Enter key is pressed', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    renderCard({}, onSelect)
    screen.getByRole('button', { name: 'Fix login bug' }).focus()
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith('wi-1')
  })

  it('does not throw when onSelect is not provided and card is clicked', async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByRole('button', { name: 'Fix login bug' }))
    // No error thrown
  })
})
