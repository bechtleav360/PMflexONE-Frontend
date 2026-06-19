import { renderHook } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'

import type { StakeholderEntry } from '@/entities/stakeholder'
import { i18n } from '@/shared/lib/i18n'

import { useStakeholderDialogStore } from '../store/useStakeholderDialogStore'
import { useStakeholderDialogData } from './useStakeholderDialogData'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const entry: StakeholderEntry = {
  id: 'e1',
  version: 1,
  name: 'Alice',
  role: 'PM',
  contactGroup: 'INTERNAL',
  email: null,
  email2: null,
  email3: null,
  phone: null,
  phone2: null,
  phone3: null,
  preferredCommunicationType: null,
  matrixPosition: { x: 0.8, y: 0.5 },
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

describe('useStakeholderDialogData', () => {
  it('returns mode=create when payload is null', () => {
    useStakeholderDialogStore.setState({ open: true, payload: null })
    const { result } = renderHook(() => useStakeholderDialogData())
    expect(result.current.mode).toBe('create')
    expect(result.current.defaultValues).toBeUndefined()
  })

  it('returns mode=edit when payload is a StakeholderEntry', () => {
    useStakeholderDialogStore.setState({ open: true, payload: entry })
    const { result } = renderHook(() => useStakeholderDialogData())
    expect(result.current.mode).toBe('edit')
    expect(result.current.defaultValues?.name).toBe('Alice')
  })

  it('includes matrixPosition in defaultValues for edit mode', () => {
    useStakeholderDialogStore.setState({ open: true, payload: entry })
    const { result } = renderHook(() => useStakeholderDialogData())
    expect(result.current.defaultValues?.matrixPosition).toEqual({ x: 0.8, y: 0.5 })
  })
})
