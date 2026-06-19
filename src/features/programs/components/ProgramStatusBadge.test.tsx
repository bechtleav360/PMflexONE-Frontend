import { render, screen } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useLookupProgramStatus } from '../hooks/useLookupProgramStatus'
import { ProgramStatusBadge } from './ProgramStatusBadge'

vi.mock('../hooks/useLookupProgramStatus')

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const sampleStatuses = [
  { status: 'draft', description: 'In planning', displayOrder: 1 },
  { status: 'created', description: 'Ready to start', displayOrder: 2 },
  { status: 'active', description: 'Currently running', displayOrder: 3 },
  { status: 'completed', description: 'Finished', displayOrder: 4 },
  { status: 'archived', description: 'No longer active', displayOrder: 5 },
]

describe('ProgramStatusBadge', () => {
  beforeEach(() => {
    vi.mocked(useLookupProgramStatus).mockReturnValue({ data: sampleStatuses } as ReturnType<
      typeof useLookupProgramStatus
    >)
  })

  it('renders an em-dash when status is null', () => {
    render(<ProgramStatusBadge status={null} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders the i18n label for the "draft" status', () => {
    render(<ProgramStatusBadge status="draft" />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders the i18n label for the "created" status', () => {
    render(<ProgramStatusBadge status="created" />)
    expect(screen.getByText('Created')).toBeInTheDocument()
  })

  it('renders the i18n label for the "active" status', () => {
    render(<ProgramStatusBadge status="active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders the i18n label for the "completed" status', () => {
    render(<ProgramStatusBadge status="completed" />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('renders the i18n label for the "archived" status', () => {
    render(<ProgramStatusBadge status="archived" />)
    expect(screen.getByText('Archived')).toBeInTheDocument()
  })

  it('falls back to the server description for a status with no i18n key', () => {
    vi.mocked(useLookupProgramStatus).mockReturnValue({
      data: [{ status: 'pending', description: 'Pending review', displayOrder: 6 }],
    } as ReturnType<typeof useLookupProgramStatus>)
    render(<ProgramStatusBadge status="pending" />)
    expect(screen.getByText('Pending review')).toBeInTheDocument()
  })

  it('falls back to the raw status code when there is no i18n key or server description', () => {
    vi.mocked(useLookupProgramStatus).mockReturnValue({ data: [] } as unknown as ReturnType<
      typeof useLookupProgramStatus
    >)
    render(<ProgramStatusBadge status="unknown-status" />)
    expect(screen.getByText('unknown-status')).toBeInTheDocument()
  })

  it('sets the aria-label to "Status: <resolved label>" for a known status', () => {
    render(<ProgramStatusBadge status="active" />)
    expect(screen.getByLabelText('Status: Active')).toBeInTheDocument()
  })

  it('sets the aria-label to "Status: —" when status is null', () => {
    render(<ProgramStatusBadge status={null} />)
    expect(screen.getByLabelText('Status: —')).toBeInTheDocument()
  })
})
