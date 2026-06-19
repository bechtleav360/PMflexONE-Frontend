import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type * as BusinessCaseModule from '@/entities/business-case'
import { useLookupBusinessCaseStatuses } from '@/entities/business-case'
import { i18n } from '@/shared/lib/i18n'

import { BusinessCaseStatusBadge } from './BusinessCaseStatusBadge'

vi.mock('@/entities/business-case', async (importOriginal) => {
  const actual = await importOriginal<typeof BusinessCaseModule>()
  return { ...actual, useLookupBusinessCaseStatuses: vi.fn() }
})

const mockUseLookupBusinessCaseStatuses = vi.mocked(useLookupBusinessCaseStatuses)

const statuses = [
  { status: 'draft', description: 'Draft', displayOrder: 1 },
  { status: 'submitted', description: 'Complete', displayOrder: 2 },
  { status: 'accepted', description: 'Accepted', displayOrder: 3 },
]

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('BusinessCaseStatusBadge', () => {
  it('renders the description resolved from statuses lookup', () => {
    mockUseLookupBusinessCaseStatuses.mockReturnValue({ data: statuses } as unknown as ReturnType<
      typeof mockUseLookupBusinessCaseStatuses
    >)
    render(<BusinessCaseStatusBadge status="draft" />)
    expect(screen.getByRole('status')).toHaveTextContent('Draft')
  })

  it('falls back to raw status when lookup data is not yet loaded', () => {
    mockUseLookupBusinessCaseStatuses.mockReturnValue({ data: undefined } as unknown as ReturnType<
      typeof mockUseLookupBusinessCaseStatuses
    >)
    render(<BusinessCaseStatusBadge status="draft" />)
    expect(screen.getByRole('status')).toHaveTextContent('draft')
  })

  it('renders em-dash when status is null and statuses not loaded', () => {
    mockUseLookupBusinessCaseStatuses.mockReturnValue({ data: undefined } as unknown as ReturnType<
      typeof mockUseLookupBusinessCaseStatuses
    >)
    render(<BusinessCaseStatusBadge status={null} />)
    expect(screen.getByRole('status')).toHaveTextContent('—')
  })

  it('applies draft styling class', () => {
    mockUseLookupBusinessCaseStatuses.mockReturnValue({ data: statuses } as unknown as ReturnType<
      typeof mockUseLookupBusinessCaseStatuses
    >)
    render(<BusinessCaseStatusBadge status="draft" />)
    expect(screen.getByRole('status')).toHaveClass('bg-muted')
  })

  it('applies submitted styling class', () => {
    mockUseLookupBusinessCaseStatuses.mockReturnValue({ data: statuses } as unknown as ReturnType<
      typeof mockUseLookupBusinessCaseStatuses
    >)
    render(<BusinessCaseStatusBadge status="submitted" />)
    expect(screen.getByRole('status')).toHaveClass('text-success')
  })

  it('applies fallback styling for unrecognised status', () => {
    mockUseLookupBusinessCaseStatuses.mockReturnValue({ data: statuses } as unknown as ReturnType<
      typeof mockUseLookupBusinessCaseStatuses
    >)
    render(<BusinessCaseStatusBadge status="unknown" />)
    expect(screen.getByRole('status')).toHaveClass('bg-muted')
  })

  it('applies fallback styling when status is null', () => {
    mockUseLookupBusinessCaseStatuses.mockReturnValue({ data: statuses } as unknown as ReturnType<
      typeof mockUseLookupBusinessCaseStatuses
    >)
    render(<BusinessCaseStatusBadge status={null} />)
    expect(screen.getByRole('status')).toHaveClass('bg-muted')
  })

  it('sets aria-label containing the resolved label', () => {
    mockUseLookupBusinessCaseStatuses.mockReturnValue({ data: statuses } as unknown as ReturnType<
      typeof mockUseLookupBusinessCaseStatuses
    >)
    render(<BusinessCaseStatusBadge status="draft" />)
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Draft'),
    )
  })
})
