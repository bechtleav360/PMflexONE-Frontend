import { describe, expect, it } from 'vitest'

import type { StakeholderEntry } from '@/entities/stakeholder'

import {
  entryToFormValues,
  formValuesToCreateInput,
  formValuesToUpdateInput,
} from './stakeholderMappers'
import type { StakeholderFormValues } from './stakeholderSchema'

const entry: StakeholderEntry = {
  id: 'e1',
  version: 1,
  name: 'Alice',
  role: 'PM',
  contactGroup: 'INTERNAL',
  email: 'alice@example.com',
  email2: null,
  email3: null,
  phone: null,
  phone2: null,
  phone3: null,
  preferredCommunicationType: null,
  matrixPosition: { x: 0.8, y: 0.5 },
  typeOfAffectedness: 'POSITIVE',
  conflictPotential: 'LOW',
  expectations: 'Good outcomes',
  responsible: { id: 'mem-1', firstName: 'Bob', lastName: 'Smith', mail: 'bob@example.com' },
  inclusionMeasures: null,
  linkedMember: { id: 'mem-2', firstName: 'Carol', lastName: 'Jones', mail: 'carol@example.com' },
  behaviouralStrategy: 'MANAGE_CLOSELY',
  scope: { id: 'proj-1', name: 'Project proj-1', scopeType: 'Project' },
  logs: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
}

describe('entryToFormValues', () => {
  it('maps all fields from StakeholderEntry to form values', () => {
    const values = entryToFormValues(entry)
    expect(values.name).toBe('Alice')
    expect(values.role).toBe('PM')
    expect(values.contactGroup).toBe('INTERNAL')
    expect(values.email).toBe('alice@example.com')
    expect(values.matrixPosition).toEqual({ x: 0.8, y: 0.5 })
    expect(values.typeOfAffectedness).toBe('POSITIVE')
    expect(values.conflictPotential).toBe('LOW')
    expect(values.expectations).toBe('Good outcomes')
    expect(values.responsible).toBe('mem-1')
    expect(values.memberId).toBe('mem-2')
  })

  it('maps null responsible to null', () => {
    const values = entryToFormValues({ ...entry, responsible: null })
    expect(values.responsible).toBeNull()
  })
})

describe('formValuesToCreateInput', () => {
  const formValues: StakeholderFormValues = {
    name: 'Alice',
    role: 'PM',
    contactGroup: 'INTERNAL',
    email: 'alice@example.com',
    email2: null,
    email3: null,
    phone: null,
    phone2: null,
    phone3: null,
    preferredCommunicationType: null,
    matrixPosition: { x: 0.8, y: 0.5 },
    typeOfAffectedness: 'POSITIVE',
    conflictPotential: null,
    expectations: null,
    responsible: 'mem-1',
    inclusionMeasures: null,
    memberId: null,
    logs: [],
  }

  it('includes scopeType and scopeId', () => {
    const input = formValuesToCreateInput(formValues, 'Project', 'proj-1')
    expect(input.scopeType).toBe('Project')
    expect(input.scopeId).toBe('proj-1')
  })

  it('maps responsible to responsibleId', () => {
    const input = formValuesToCreateInput(formValues, 'Project', 'proj-1')
    expect(input.responsibleId).toBe('mem-1')
    expect((input as unknown as Record<string, unknown>).responsible).toBeUndefined()
  })
})

describe('formValuesToUpdateInput', () => {
  const formValues: StakeholderFormValues = {
    name: 'Alice',
    role: 'PM',
    contactGroup: 'INTERNAL',
    typeOfAffectedness: 'NEUTRAL',
  }

  it('maps responsible to responsibleId', () => {
    const input = formValuesToUpdateInput({ ...formValues, responsible: 'mem-99' })
    expect(input.responsibleId).toBe('mem-99')
  })

  it('does not include scopeType or scopeId', () => {
    const input = formValuesToUpdateInput(formValues) as Record<string, unknown>
    expect(input.scopeType).toBeUndefined()
    expect(input.scopeId).toBeUndefined()
  })
})
