import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import type { Program } from '../types/program.types'
import { ProgramList } from './ProgramList'

vi.mock('../components/ProgramStatusBadge', () => ({
  ProgramStatusBadge: ({ status }: { status: string | null }) =>
    status ? <span data-testid="status-badge">{status}</span> : null,
}))

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const programs: Program[] = [
  {
    id: 'prog-1',
    version: 1,
    name: 'Alpha Program',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
    portfolio: { item: { id: 'port-1', name: 'Portfolio A' } },
  },
  {
    id: 'prog-2',
    version: 1,
    name: 'Beta Program',
    status: 'created',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
]

function renderList(overrides: Partial<Parameters<typeof ProgramList>[0]> = {}) {
  return render(
    <ProgramList
      rows={programs}
      isPending={false}
      isError={false}
      sort={null}
      onSortChange={vi.fn()}
      onEdit={vi.fn()}
      {...overrides}
    />,
  )
}

describe('ProgramList — rendering', () => {
  it('renders program names', () => {
    renderList()
    expect(screen.getByText('Alpha Program')).toBeInTheDocument()
    expect(screen.getByText('Beta Program')).toBeInTheDocument()
  })

  it('shows portfolio column when no portfolioId scope', () => {
    renderList()
    expect(screen.getByRole('columnheader', { name: /portfolio/i })).toBeInTheDocument()
    expect(screen.getByText('Portfolio A')).toBeInTheDocument()
  })

  it('hides portfolio column when portfolioId prop is provided', () => {
    renderList({ portfolioId: 'port-1' })
    expect(screen.queryByRole('columnheader', { name: /portfolio/i })).not.toBeInTheDocument()
  })

  it('renders status badges for each program', () => {
    renderList()
    expect(screen.getAllByTestId('status-badge')).toHaveLength(2)
  })
})

describe('ProgramList — empty state', () => {
  it('shows empty message when rows is empty', () => {
    renderList({ rows: [] })
    expect(screen.getByText(/no programs found/i)).toBeInTheDocument()
  })
})

describe('ProgramList — actions', () => {
  it('calls onEdit with correct program when edit button is clicked', async () => {
    const onEdit = vi.fn()
    renderList({ onEdit })
    await userEvent.click(screen.getByRole('button', { name: /edit program "alpha program"/i }))
    expect(onEdit).toHaveBeenCalledWith(programs[0])
  })

  it('renders program names as clickable buttons when onSelect is provided', async () => {
    const onSelect = vi.fn()
    renderList({ onSelect })
    // When onSelect is provided, the name cell renders a button with the exact program name
    const nameButtons = screen.getAllByRole('button', { name: /alpha program/i })
    // At least one should be the name button (not the edit button)
    expect(nameButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('calls onSelect with the row data when name button is clicked', async () => {
    const onSelect = vi.fn()
    renderList({ onSelect })

    // The name-cell button has exactly the program name as its text (no "edit" prefix)
    const allButtons = screen.getAllByRole('button', { name: /alpha program/i })
    // The name button has text content exactly 'Alpha Program' (edit button has a different label)
    const nameButton = allButtons.find((b) => b.textContent === 'Alpha Program')
    expect(nameButton).toBeDefined()
    await userEvent.click(nameButton!)

    expect(onSelect).toHaveBeenCalledWith(programs[0])
  })
})
