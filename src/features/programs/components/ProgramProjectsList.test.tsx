import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import type { ProgramProjectEdge } from '../types/program.types'
import { ProgramProjectsList } from './ProgramProjectsList'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const projects: ProgramProjectEdge[] = [
  { item: { id: 'e2e00000-0000-0000-0000-000000000001', name: 'Alpha Project', status: 'active' } },
  { item: { id: 'proj-2', name: 'Beta Project', status: null } },
]

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('ProgramProjectsList — rendering', () => {
  it('renders null when projects is undefined', () => {
    const { container } = renderWithRouter(<ProgramProjectsList />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders null when projects array is empty', () => {
    const { container } = renderWithRouter(<ProgramProjectsList projects={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a list item for each project', () => {
    renderWithRouter(<ProgramProjectsList projects={projects} />)
    expect(screen.getByText('Alpha Project')).toBeInTheDocument()
    expect(screen.getByText('Beta Project')).toBeInTheDocument()
  })

  it('renders links pointing to the correct project routes', () => {
    renderWithRouter(<ProgramProjectsList projects={projects} />)
    const alphaLink = screen.getByRole('link', { name: 'Alpha Project' })
    const betaLink = screen.getByRole('link', { name: 'Beta Project' })
    expect(alphaLink).toHaveAttribute('href', '/projects/e2e00000-0000-0000-0000-000000000001')
    expect(betaLink).toHaveAttribute('href', '/projects/proj-2')
  })

  it('renders the section title', () => {
    renderWithRouter(<ProgramProjectsList projects={projects} />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('renders a list element', () => {
    renderWithRouter(<ProgramProjectsList projects={projects} />)
    expect(screen.getByRole('list')).toBeInTheDocument()
  })
})
