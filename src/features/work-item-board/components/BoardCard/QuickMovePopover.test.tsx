import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type * as WorkItemModule from '@/entities/work-item'
import type { ProjectWorkItem } from '@/entities/work-item'
import { TooltipProvider } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { QuickMovePopover } from './QuickMovePopover'

const mockMoveMutate = vi.fn()

vi.mock('../../hooks/useMoveWorkItemInColumn', () => ({
  useMoveWorkItemInColumn: () => ({ mutate: mockMoveMutate, isPending: false }),
}))

const BOARD_COLUMNS = [
  {
    id: 'col-open',
    name: 'Open',
    position: 0,
    workItemStatus: 'open',
    baseStatus: 'open' as const,
    version: 1,
    createdAt: '',
    updatedAt: '',
    metadata: null,
    creator: null,
    updater: null,
    board: null,
    workItems: [{ id: 'wi-1' }],
  },
  {
    id: 'col-done',
    name: 'Done',
    position: 1,
    workItemStatus: 'done',
    baseStatus: 'done' as const,
    version: 1,
    createdAt: '',
    updatedAt: '',
    metadata: null,
    creator: null,
    updater: null,
    board: null,
    workItems: [],
  },
]

vi.mock('@/entities/work-item', async (importOriginal) => {
  const actual = await importOriginal<typeof WorkItemModule>()
  return {
    ...actual,
    useBoard: () => ({
      data: {
        id: 'board-1',
        columns: BOARD_COLUMNS,
      },
    }),
    BOARD_QUERY_KEY: (id: string) => ['board', id],
    WORK_ITEMS_QUERY_KEY: (type: string, id: string) => ['workItems', type, id],
  }
})

function makeWorkItem(overrides: Partial<ProjectWorkItem> = {}): ProjectWorkItem {
  return {
    id: 'wi-1',
    version: 2,
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
    assignee: null,
    boardColumn: { id: 'col-open', position: 0 } as never,
    labels: [],
    scope: { id: 'proj-1', name: 'Test Project' } as never,
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

function renderPopover(direction: 'left' | 'right' = 'right') {
  const Wrapper = makeWrapper()
  return render(
    createElement(
      Wrapper,
      null,
      createElement(QuickMovePopover, {
        workItem: makeWorkItem(),
        currentBoardId: 'board-1',
        direction,
      }),
    ),
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('QuickMovePopover', () => {
  it('renders the trigger button', () => {
    renderPopover()
    expect(screen.getByRole('button', { name: /move card/i })).toBeInTheDocument()
  })

  it('opens the popover when the trigger is clicked', async () => {
    const user = userEvent.setup()
    renderPopover()

    await user.click(screen.getByRole('button', { name: /move card/i }))
    // The QuickMoveContent should now be visible
    expect(screen.getByText(/active tasks/i)).toBeInTheDocument()
  })

  it('renders with left direction trigger', () => {
    renderPopover('left')
    const btn = screen.getByRole('button', { name: /move card/i })
    expect(btn).toBeInTheDocument()
  })

  it('renders suggested columns in the popover', async () => {
    const user = userEvent.setup()
    renderPopover()

    await user.click(screen.getByRole('button', { name: /move card/i }))
    // 'Done' may appear both in the suggestion button and the Select trigger value
    expect(screen.getAllByText('Done').length).toBeGreaterThan(0)
  })
})

describe('QuickMovePopover — move actions', () => {
  it('calls the move mutation when a suggested column button is clicked', async () => {
    const user = userEvent.setup()
    mockMoveMutate.mockClear()
    renderPopover()

    await user.click(screen.getByRole('button', { name: /move card/i }))
    // Click the "Done" suggestion button inside the popover
    const doneButtons = screen.getAllByText('Done')
    // The first match is the suggestion button (before the select)
    await user.click(doneButtons[0])

    expect(mockMoveMutate).toHaveBeenCalledWith(
      expect.objectContaining({ workItemId: 'wi-1', boardColumnId: 'col-done' }),
      expect.any(Object),
    )
  })

  it('calls the move mutation with null boardColumnId when "Active Tasks" pool button is clicked', async () => {
    const user = userEvent.setup()
    mockMoveMutate.mockClear()
    renderPopover()

    await user.click(screen.getByRole('button', { name: /move card/i }))
    const activeTasksBtn = screen.getByText(/active tasks/i)
    await user.click(activeTasksBtn)

    expect(mockMoveMutate).toHaveBeenCalledWith(
      expect.objectContaining({ workItemId: 'wi-1', boardColumnId: null }),
      expect.any(Object),
    )
  })

  it('closes the popover after a successful move (onSuccess callback runs)', async () => {
    const user = userEvent.setup()
    // Simulate immediate onSuccess
    mockMoveMutate.mockImplementation(
      (_args: unknown, { onSuccess }: { onSuccess: () => void }) => {
        onSuccess()
      },
    )
    renderPopover()

    await user.click(screen.getByRole('button', { name: /move card/i }))
    const doneButtons = screen.getAllByText('Done')
    await user.click(doneButtons[0])

    // After onSuccess, the popover should close — "Active Tasks" is no longer visible
    expect(screen.queryByText(/active tasks/i)).not.toBeInTheDocument()

    // Restore original mock
    mockMoveMutate.mockImplementation(vi.fn())
  })

  it('calls the main Move button when clicking the Move CTA with effectiveColumnId', async () => {
    const user = userEvent.setup()
    mockMoveMutate.mockClear()
    renderPopover()

    await user.click(screen.getByRole('button', { name: /move card/i }))

    // The Move button is the CTA at the bottom of the popover content
    const moveBtn = screen.getByRole('button', { name: /^move$/i })
    await user.click(moveBtn)

    expect(mockMoveMutate).toHaveBeenCalledWith(
      expect.objectContaining({ workItemId: 'wi-1' }),
      expect.any(Object),
    )
  })
})
