import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import type { Program } from '../types/program.types'
import { ProgramDetailFields } from './ProgramDetailFields'

vi.mock('./ProgramStatusBadge', () => ({
  ProgramStatusBadge: ({ status }: { status: string | null }) => (
    <span data-testid="status-badge">{status ?? '—'}</span>
  ),
}))

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const baseProgram: Program = {
  id: 'p-1',
  version: 1,
  name: 'Alpha',
  status: 'active',
  createdAt: '2024-03-15T00:00:00Z',
  updatedAt: '2024-04-20T00:00:00Z',
  creator: { id: 'u-1', firstName: 'Alice', lastName: 'Smith' },
  updater: { id: 'u-2', firstName: 'Bob', lastName: 'Jones' },
  portfolio: { item: { id: 'port-1', name: 'Main Portfolio' } },
}

// eslint-disable-next-line max-lines-per-function -- test describe block; splitting individual it() callbacks hurts readability
describe('ProgramDetailFields — rendering', () => {
  it('renders ProgramStatusBadge with the program status', () => {
    render(
      <ProgramDetailFields
        data={baseProgram}
        locale="en-US"
      />,
    )
    expect(screen.getByTestId('status-badge')).toHaveTextContent('active')
  })

  it('renders the portfolio name', () => {
    render(
      <ProgramDetailFields
        data={baseProgram}
        locale="en-US"
      />,
    )
    expect(screen.getByText('Main Portfolio')).toBeInTheDocument()
  })

  it('renders creator full name', () => {
    render(
      <ProgramDetailFields
        data={baseProgram}
        locale="en-US"
      />,
    )
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
  })

  it('renders updater full name', () => {
    render(
      <ProgramDetailFields
        data={baseProgram}
        locale="en-US"
      />,
    )
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
  })

  it('renders em-dash when portfolio is null', () => {
    const data: Program = { ...baseProgram, portfolio: null }
    render(
      <ProgramDetailFields
        data={data}
        locale="en-US"
      />,
    )
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1)
  })

  it('renders em-dash when creator is null', () => {
    const data: Program = { ...baseProgram, creator: null }
    render(
      <ProgramDetailFields
        data={data}
        locale="en-US"
      />,
    )
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1)
  })

  it('renders em-dash when updater is null', () => {
    const data: Program = { ...baseProgram, updater: null }
    render(
      <ProgramDetailFields
        data={data}
        locale="en-US"
      />,
    )
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1)
  })

  it('formats createdAt using the provided locale', () => {
    render(
      <ProgramDetailFields
        data={baseProgram}
        locale="en-US"
      />,
    )
    const expected = new Date('2024-03-15T00:00:00Z').toLocaleDateString('en-US')
    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  it('formats updatedAt using the provided locale', () => {
    render(
      <ProgramDetailFields
        data={baseProgram}
        locale="en-US"
      />,
    )
    const expected = new Date('2024-04-20T00:00:00Z').toLocaleDateString('en-US')
    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  it('renders a definition list element', () => {
    const { container } = render(
      <ProgramDetailFields
        data={baseProgram}
        locale="en-US"
      />,
    )
    expect(container.querySelector('dl')).toBeInTheDocument()
  })
})
