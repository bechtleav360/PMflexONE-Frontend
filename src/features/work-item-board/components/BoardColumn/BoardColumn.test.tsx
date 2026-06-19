/* eslint-disable max-lines-per-function -- test suite; describe blocks naturally exceed function line limit */
import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type { BoardColumn as BoardColumnType, ProjectWorkItem } from '@/entities/work-item'
import { TooltipProvider } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { BoardColumn } from './BoardColumn'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockMutateAsync = vi.fn().mockResolvedValue({})

vi.mock('../../hooks/useUpdateBoardColumnInline', () => ({
  useUpdateBoardColumnInline: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

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

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function makeColumn(overrides: Partial<BoardColumnType> = {}): BoardColumnType {
  return {
    id: 'col-1',
    version: 1,
    name: 'To Do',
    workItemStatus: 'open',
    position: 0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    metadata: null,
    creator: null,
    updater: null,
    board: null as never,
    workItems: [],
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

function renderColumn(
  columnOverrides: Partial<BoardColumnType> = {},
  extraProps: Record<string, unknown> = {},
) {
  const Wrapper = makeWrapper()
  const column = makeColumn(columnOverrides)
  return render(
    createElement(
      Wrapper,
      null,
      createElement(BoardColumn, { column, boardId: 'board-1', ...extraProps }),
    ),
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('BoardColumn — rendering', () => {
  it('renders the column name', () => {
    renderColumn({ name: 'To Do' })
    expect(screen.getByText('To Do')).toBeInTheDocument()
  })

  it('renders the Add a task button', () => {
    renderColumn()
    expect(screen.getByRole('button', { name: /add a task/i })).toBeInTheDocument()
  })

  it('renders work items in the column (non-archived)', () => {
    const items = [
      makeWorkItem({ id: 'wi-1', name: 'First task' }),
      makeWorkItem({ id: 'wi-2', name: 'Second task' }),
    ] as never
    renderColumn({ workItems: items })
    expect(screen.getByText('First task')).toBeInTheDocument()
    expect(screen.getByText('Second task')).toBeInTheDocument()
  })

  it('does not render archived work items', () => {
    const items = [
      makeWorkItem({ id: 'wi-1', name: 'Active task', archived: false }),
      makeWorkItem({ id: 'wi-2', name: 'Archived task', archived: true }),
    ] as never
    renderColumn({ workItems: items })
    expect(screen.getByText('Active task')).toBeInTheDocument()
    expect(screen.queryByText('Archived task')).not.toBeInTheDocument()
  })

  it('renders the item count', () => {
    const items = [
      makeWorkItem({ id: 'wi-1', name: 'Task A' }),
      makeWorkItem({ id: 'wi-2', name: 'Task B' }),
    ] as never
    renderColumn({ workItems: items })
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders the drag handle when dragHandleProps are provided', () => {
    renderColumn({}, { dragHandleProps: { 'data-testid': 'drag-handle' } })
    expect(screen.getByTestId('drag-handle')).toBeInTheDocument()
  })

  it('does not render the drag handle when dragHandleProps are absent', () => {
    renderColumn()
    expect(screen.queryByTestId('drag-handle')).not.toBeInTheDocument()
  })

  it('calls onAddTask when the Add a task button is clicked', async () => {
    const onAddTask = vi.fn()
    const user = userEvent.setup()
    renderColumn({}, { onAddTask })
    await user.click(screen.getByRole('button', { name: /add a task/i }))
    expect(onAddTask).toHaveBeenCalledOnce()
  })

  it('calls onSelect when a card is clicked', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    const items = [makeWorkItem({ id: 'wi-1', name: 'Clickable task' })] as never
    renderColumn({ workItems: items }, { onSelect })
    await user.click(screen.getByText('Clickable task'))
    expect(onSelect).toHaveBeenCalledWith('wi-1')
  })
})

describe('BoardColumn — edit name and drag', () => {
  it('switches to edit mode when the column name button is clicked', async () => {
    const user = userEvent.setup()
    renderColumn({ name: 'To Do' })
    await user.click(screen.getByRole('button', { name: 'To Do' }))
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('saves the column name on Enter key', async () => {
    const user = userEvent.setup()
    renderColumn({ name: 'To Do' })
    await user.click(screen.getByRole('button', { name: 'To Do' }))
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'In Progress{Enter}')
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ input: expect.objectContaining({ name: 'In Progress' }) }),
    )
  })

  it('cancels edit on Escape and restores original name', async () => {
    const user = userEvent.setup()
    renderColumn({ name: 'To Do' })
    await user.click(screen.getByRole('button', { name: 'To Do' }))
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'Changed{Escape}')
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'To Do' })).toBeInTheDocument()
  })

  it('saves the column name when the input loses focus (onBlur)', async () => {
    mockMutateAsync.mockClear()
    const user = userEvent.setup()
    renderColumn({ name: 'Original' })
    await user.click(screen.getByRole('button', { name: 'Original' }))
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'Blurred')
    await user.tab()
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ input: expect.objectContaining({ name: 'Blurred' }) }),
    )
  })

  it('does not call mutateAsync when name is unchanged on save', async () => {
    mockMutateAsync.mockClear()
    const user = userEvent.setup()
    renderColumn({ name: 'Same Name' })
    await user.click(screen.getByRole('button', { name: 'Same Name' }))
    await user.type(screen.getByRole('textbox'), '{Enter}')
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('calls onNativeDrop when a work item is dropped on the column', () => {
    const onNativeDrop = vi.fn()
    const { container } = renderColumn({}, { onNativeDrop })
    const columnEl = container.querySelector('[role="group"][data-column-id]')
    expect(columnEl).toBeTruthy()
    fireEvent.drop(columnEl!, {
      dataTransfer: {
        getData: (type: string) =>
          type === 'text/work-item-id'
            ? 'wi-dropped'
            : type === 'text/work-item-version'
              ? '3'
              : '',
      },
    })
    expect(onNativeDrop).toHaveBeenCalledWith('wi-dropped', 3, 'col-1')
  })

  it('does not call onNativeDrop for drop events without work-item-id', () => {
    const onNativeDrop = vi.fn()
    const { container } = renderColumn({}, { onNativeDrop })
    const columnEl = container.querySelector('[role="group"][data-column-id]')
    fireEvent.drop(columnEl!, { dataTransfer: { getData: () => '' } })
    expect(onNativeDrop).not.toHaveBeenCalled()
  })

  it('highlights the column when a valid work item is dragged over', () => {
    const { container } = renderColumn()
    const columnEl = container.querySelector('[role="group"][data-column-id]')
    expect(columnEl).toBeTruthy()
    fireEvent.dragOver(columnEl!, {
      dataTransfer: { types: ['text/work-item-id'], dropEffect: '' },
    })
    expect(columnEl!.className).toMatch(/ring/)
  })

  it('removes highlight when drag leaves the column', () => {
    const { container } = renderColumn()
    const columnEl = container.querySelector('[role="group"][data-column-id]')
    fireEvent.dragOver(columnEl!, {
      dataTransfer: { types: ['text/work-item-id'], dropEffect: '' },
    })
    fireEvent.dragLeave(columnEl!, { relatedTarget: null })
    expect(columnEl!.className).not.toMatch(/scale-\[1\.02\]/)
  })

  it('sets pool-drag-over state on pointer enter with button pressed', () => {
    const { container } = renderColumn()
    const columnEl = container.querySelector('[role="group"][data-column-id]')
    expect(columnEl).toBeTruthy()
    fireEvent.pointerEnter(columnEl!, { buttons: 1 })
    expect(columnEl!.className).toMatch(/ring/)
  })
})
