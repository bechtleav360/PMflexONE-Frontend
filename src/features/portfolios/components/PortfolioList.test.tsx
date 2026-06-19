import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import type { Portfolio } from '../types/portfolio.types'
import { PortfolioList } from './PortfolioList'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const portfolios: Portfolio[] = [
  {
    id: 'p1',
    version: 1,
    name: 'Digital Transformation',
    startYear: 2026,
    endYear: 2028,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'p2',
    version: 1,
    name: 'Cloud Migration',
    startYear: null,
    endYear: null,
    createdAt: '2026-02-01T00:00:00Z',
  },
]

function renderList(overrides: Partial<Parameters<typeof PortfolioList>[0]> = {}) {
  return render(
    createElement(
      MemoryRouter,
      null,
      createElement(PortfolioList, {
        rows: portfolios,
        isPending: false,
        isError: false,
        sort: null,
        onSortChange: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        ...overrides,
      }),
    ),
  )
}

describe('PortfolioList — rendering', () => {
  it('renders portfolio names', () => {
    renderList()
    expect(screen.getByText('Digital Transformation')).toBeInTheDocument()
    expect(screen.getByText('Cloud Migration')).toBeInTheDocument()
  })

  it('renders numeric years as strings', () => {
    renderList()
    expect(screen.getByText('2026')).toBeInTheDocument()
    expect(screen.getByText('2028')).toBeInTheDocument()
  })

  it('renders a dash placeholder for null years', () => {
    renderList()
    const dashes = screen.getAllByText('–')
    expect(dashes.length).toBeGreaterThanOrEqual(2)
  })

  it('renders column headers', () => {
    renderList()
    expect(screen.getByText(/title/i)).toBeInTheDocument()
    expect(screen.getByText(/start year/i)).toBeInTheDocument()
    expect(screen.getByText(/end year/i)).toBeInTheDocument()
  })
})

describe('PortfolioList — empty state', () => {
  it('shows empty description when rows is empty and no error', () => {
    renderList({ rows: [] })
    expect(screen.getByText(/there is nothing to show right now/i)).toBeInTheDocument()
  })

  it('shows generic no-data description when isError is true', () => {
    renderList({ rows: [], isError: true })
    expect(screen.queryByText(/no portfolios have been created yet/i)).not.toBeInTheDocument()
  })
})

describe('PortfolioList — actions', () => {
  it('calls onEdit with the correct portfolio when edit is clicked', async () => {
    const onEdit = vi.fn()
    renderList({ onEdit })
    await userEvent.click(
      screen.getByRole('button', { name: /edit portfolio "digital transformation"/i }),
    )
    expect(onEdit).toHaveBeenCalledWith(portfolios[0])
  })

  it('calls onDelete with the correct portfolio when delete is clicked', async () => {
    const onDelete = vi.fn()
    renderList({ onDelete })
    await userEvent.click(
      screen.getByRole('button', { name: /delete portfolio "cloud migration"/i }),
    )
    expect(onDelete).toHaveBeenCalledWith(portfolios[1])
  })
})
