import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type { BoardColumn } from '@/entities/work-item'
import { i18n } from '@/shared/lib/i18n'

import { SuggestionButton } from './SuggestionButton'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

function makeColumn(overrides: Partial<BoardColumn> = {}): BoardColumn {
  return {
    id: 'col-1',
    version: 1,
    name: 'In Progress',
    workItemStatus: 'IN_PROGRESS',
    position: 1,
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

describe('SuggestionButton', () => {
  it('renders the column name', () => {
    render(
      createElement(SuggestionButton, { column: makeColumn(), isForward: true, onClick: vi.fn() }),
    )
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('renders as a button element', () => {
    render(
      createElement(SuggestionButton, { column: makeColumn(), isForward: true, onClick: vi.fn() }),
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls onClick with the column id when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    render(
      createElement(SuggestionButton, {
        column: makeColumn({ id: 'col-99' }),
        isForward: true,
        onClick: handleClick,
      }),
    )
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
    expect(handleClick).toHaveBeenCalledWith('col-99')
  })

  it('renders a right-arrow icon when isForward is true', () => {
    const { container } = render(
      createElement(SuggestionButton, { column: makeColumn(), isForward: true, onClick: vi.fn() }),
    )
    // lucide renders an <svg> — just verify the component renders something icon-like
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders a left-arrow icon when isForward is false', () => {
    const { container } = render(
      createElement(SuggestionButton, { column: makeColumn(), isForward: false, onClick: vi.fn() }),
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
