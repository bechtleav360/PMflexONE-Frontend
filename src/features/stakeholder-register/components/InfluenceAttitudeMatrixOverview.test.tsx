import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'

import type { StakeholderEntry } from '@/entities/stakeholder'
import { i18n } from '@/shared/lib/i18n'

import { InfluenceAttitudeMatrixOverview } from './InfluenceAttitudeMatrixOverview'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

function makeEntry(id: string, x: number, y: number): StakeholderEntry {
  return {
    id,
    version: 1,
    name: `Entry ${id}`,
    role: 'PM',
    contactGroup: 'INTERNAL',
    email: null,
    email2: null,
    email3: null,
    phone: null,
    phone2: null,
    phone3: null,
    preferredCommunicationType: null,
    matrixPosition: { x, y },
    typeOfAffectedness: null,
    conflictPotential: null,
    expectations: null,
    responsible: null,
    inclusionMeasures: null,
    linkedMember: null,
    behaviouralStrategy: null,
    scope: { id: 'proj-1', name: 'Project proj-1', scopeType: 'Project' },
    logs: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }
}

describe('InfluenceAttitudeMatrixOverview', () => {
  it('renders the matrix container', () => {
    render(<InfluenceAttitudeMatrixOverview entries={[]} />)
    expect(screen.getByRole('application')).toBeInTheDocument()
  })

  it('renders no dots when entries is empty', () => {
    render(<InfluenceAttitudeMatrixOverview entries={[]} />)
    expect(screen.queryAllByTestId('overview-dot')).toHaveLength(0)
  })

  it('renders a dot for each entry that has a position', () => {
    const entries = [makeEntry('a', 0.3, 0.7), makeEntry('b', 0.8, 0.2), makeEntry('c', 0.5, 0.5)]
    render(<InfluenceAttitudeMatrixOverview entries={entries} />)
    expect(screen.getAllByTestId('overview-dot')).toHaveLength(3)
  })

  it('skips entries without a matrix position', () => {
    const withPos = makeEntry('a', 0.5, 0.5)
    const withoutPos: StakeholderEntry = { ...withPos, id: 'b', matrixPosition: null }
    render(<InfluenceAttitudeMatrixOverview entries={[withPos, withoutPos]} />)
    expect(screen.getAllByTestId('overview-dot')).toHaveLength(1)
  })

  it('dots carry the entry name as their label', () => {
    render(<InfluenceAttitudeMatrixOverview entries={[makeEntry('x', 0.6, 0.6)]} />)
    expect(screen.getByLabelText('Entry x')).toBeInTheDocument()
  })

  it('does not render drag handlers (read-only)', () => {
    render(<InfluenceAttitudeMatrixOverview entries={[makeEntry('a', 0.5, 0.5)]} />)
    const canvas = screen.getByRole('application')
    expect(canvas).not.toHaveAttribute('tabindex')
  })
})
