import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type { StakeholderEntry } from '@/entities/stakeholder'
import { i18n } from '@/shared/lib/i18n'

import { StakeholderRegisterListView } from './StakeholderRegisterListView'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const entry: StakeholderEntry = {
  id: 'e1',
  version: 1,
  name: 'Alice Müller',
  role: 'Project Manager',
  contactGroup: 'INTERNAL',
  email: null,
  email2: null,
  email3: null,
  phone: null,
  phone2: null,
  phone3: null,
  preferredCommunicationType: null,
  matrixPosition: null,
  typeOfAffectedness: 'POSITIVE',
  conflictPotential: 'LOW',
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

describe('StakeholderRegisterListView', () => {
  it('renders entries in the table', () => {
    render(
      <StakeholderRegisterListView
        entries={[entry]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText('Alice Müller')).toBeInTheDocument()
    expect(screen.getByText('Project Manager')).toBeInTheDocument()
  })

  it('shows empty state when no entries', () => {
    render(
      <StakeholderRegisterListView
        entries={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.queryByText('Alice Müller')).not.toBeInTheDocument()
  })

  it('shows edit and delete buttons when canWrite', () => {
    render(
      <StakeholderRegisterListView
        entries={[entry]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('hides edit and delete buttons when canWrite is false', () => {
    render(
      <StakeholderRegisterListView
        entries={[entry]}
        canWrite={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })
})
