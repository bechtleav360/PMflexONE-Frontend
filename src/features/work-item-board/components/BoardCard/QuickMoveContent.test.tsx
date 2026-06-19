import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type { BoardColumn } from '@/entities/work-item'
import { Popover, TooltipProvider } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { QuickMoveContent } from './QuickMoveContent'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

function makeColumn(
  overrides: Partial<BoardColumn> & { id: string; name: string; position: number },
): BoardColumn {
  return {
    version: 1,
    workItemStatus: 'open',
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

const COL_A = makeColumn({ id: 'col-a', name: 'To Do', position: 0 })
const COL_B = makeColumn({ id: 'col-b', name: 'Review', position: 2 })

function defaultProps(overrides: Record<string, unknown> = {}) {
  return {
    suggestedColumns: [COL_A, COL_B],
    currentColumnId: 'col-current',
    currentColumnPosition: 1,
    sortedCols: [COL_A, COL_B],
    effectiveColumnId: 'col-a',
    onColumnChange: vi.fn(),
    onMove: vi.fn(),
    onMoveToPool: vi.fn(),
    isPending: false,
    ...overrides,
  }
}

function renderContent(props = defaultProps()) {
  return render(
    createElement(
      TooltipProvider,
      null,
      // QuickMoveContent renders a PopoverContent which requires a Popover context
      createElement(Popover, { open: true }, createElement(QuickMoveContent, props as never)),
    ),
  )
}

describe('QuickMoveContent', () => {
  it('renders suggestion buttons for each suggested column', () => {
    renderContent()
    // Use getAllByText because the Select trigger also shows the value
    expect(screen.getAllByText('To Do').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Review').length).toBeGreaterThan(0)
  })

  it('renders the "Active Tasks" pool button when currentColumnId is provided', () => {
    renderContent()
    expect(screen.getByText(/active tasks/i)).toBeInTheDocument()
  })

  it('does not render pool button when currentColumnId is undefined', () => {
    renderContent(defaultProps({ currentColumnId: undefined }))
    expect(screen.queryByText(/active tasks/i)).not.toBeInTheDocument()
  })

  it('calls onMove with the suggestion column id when a suggestion is clicked', async () => {
    const onMove = vi.fn()
    const user = userEvent.setup()
    renderContent(defaultProps({ onMove }))

    // Click the first button that contains the column name (the SuggestionButton)
    const buttons = screen.getAllByRole('button')
    // Find the SuggestionButton for 'To Do' — it's not the select trigger (combobox)
    const toDoBtns = buttons.filter(
      (btn) => btn.textContent?.includes('To Do') && btn.getAttribute('role') !== 'combobox',
    )
    await user.click(toDoBtns[0])
    expect(onMove).toHaveBeenCalledWith('col-a')
  })

  it('calls onMoveToPool when the pool button is clicked', async () => {
    const onMoveToPool = vi.fn()
    const user = userEvent.setup()
    renderContent(defaultProps({ onMoveToPool }))

    await user.click(screen.getByText(/active tasks/i))
    expect(onMoveToPool).toHaveBeenCalledOnce()
  })

  it('calls onMove with effectiveColumnId when the Move button is clicked', async () => {
    const onMove = vi.fn()
    const user = userEvent.setup()
    renderContent(defaultProps({ onMove, effectiveColumnId: 'col-b' }))

    const moveBtn = screen.getByRole('button', { name: /move/i })
    await user.click(moveBtn)
    expect(onMove).toHaveBeenCalledWith('col-b')
  })

  it('disables the Move button when effectiveColumnId is empty', () => {
    renderContent(defaultProps({ effectiveColumnId: '' }))
    const moveBtn = screen.getByRole('button', { name: /move/i })
    expect(moveBtn).toBeDisabled()
  })

  it('disables the Move button and pool button when isPending is true', () => {
    renderContent(defaultProps({ isPending: true }))
    const moveBtn = screen.getByRole('button', { name: /move/i })
    expect(moveBtn).toBeDisabled()

    const poolBtn = screen.getByText(/active tasks/i).closest('button')
    expect(poolBtn).toBeDisabled()
  })
})
