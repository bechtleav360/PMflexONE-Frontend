import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'

import type { ProjectCharterStatus } from '@/entities/project-charter'
import { i18n } from '@/shared/lib/i18n'

import { ProjectCharterStatusBadge } from './ProjectCharterStatusBadge'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('ProjectCharterStatusBadge', () => {
  it.each([
    ['DRAFT', /draft/i],
    ['SUBMITTED', /submitted/i],
    ['ACCEPTED', /accepted/i],
  ] as const)('renders %s with correct translated label', (status, pattern) => {
    render(<ProjectCharterStatusBadge status={status} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText(pattern)).toBeInTheDocument()
  })

  it('applies DRAFT styling class', () => {
    render(<ProjectCharterStatusBadge status="DRAFT" />)
    expect(screen.getByRole('status')).toHaveClass('bg-muted')
  })

  it('applies SUBMITTED styling class', () => {
    render(<ProjectCharterStatusBadge status="SUBMITTED" />)
    expect(screen.getByRole('status')).toHaveClass('text-info')
  })

  it('applies ACCEPTED styling class', () => {
    render(<ProjectCharterStatusBadge status="ACCEPTED" />)
    expect(screen.getByRole('status')).toHaveClass('text-success')
  })

  it('sets aria-label containing the translated status label', () => {
    render(<ProjectCharterStatusBadge status="DRAFT" />)
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Draft'),
    )
  })

  it('falls back to default muted class for an unrecognised status value', () => {
    render(<ProjectCharterStatusBadge status={'UNKNOWN' as ProjectCharterStatus} />)
    expect(screen.getByRole('status')).toHaveClass('bg-muted')
  })
})
