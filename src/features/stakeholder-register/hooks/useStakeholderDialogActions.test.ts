import { renderHook } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { StakeholderEntry } from '@/entities/stakeholder'
import { i18n } from '@/shared/lib/i18n'

import { useStakeholderDialogStore } from '../store/useStakeholderDialogStore'
import { useStakeholderDialogActions } from './useStakeholderDialogActions'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  mockCreate.mockClear()
  mockUpdate.mockClear()
})

const mockCreate = vi.fn().mockResolvedValue({ id: 'new-entry-id' })
const mockUpdate = vi.fn().mockResolvedValue({ id: 'e1' })

vi.mock('./useCreateStakeholder', () => ({
  useCreateStakeholder: () => ({ mutateAsync: mockCreate }),
}))

vi.mock('./useUpdateStakeholder', () => ({
  useUpdateStakeholder: () => ({ mutateAsync: mockUpdate }),
}))

vi.mock('sonner', () => ({
  toast: { promise: vi.fn() },
}))

vi.mock('../api/stakeholderLogApi', () => ({
  createStakeholderLog: vi.fn().mockResolvedValue({}),
  updateStakeholderLog: vi.fn().mockResolvedValue({}),
  deleteStakeholderLog: vi.fn().mockResolvedValue(true),
}))

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn().mockResolvedValue(undefined) }),
  }
})

const editEntry: StakeholderEntry = {
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
  matrixPosition: null,
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

const formValues = {
  name: 'Alice',
  role: 'PM',
  contactGroup: 'INTERNAL' as const,
  typeOfAffectedness: 'NEUTRAL' as const,
}

describe('useStakeholderDialogActions', () => {
  it('calls create mutation in create mode (payload=null)', async () => {
    useStakeholderDialogStore.setState({ open: true, payload: null })
    const { result } = renderHook(() =>
      useStakeholderDialogActions({ scopeType: 'Project', scopeId: 'proj-1' }),
    )
    await result.current.handleSave(formValues)
    expect(mockCreate).toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('calls update mutation in edit mode (payload=entry)', async () => {
    useStakeholderDialogStore.setState({ open: true, payload: editEntry })
    const { result } = renderHook(() =>
      useStakeholderDialogActions({ scopeType: 'Project', scopeId: 'proj-1' }),
    )
    await result.current.handleSave(formValues)
    expect(mockUpdate).toHaveBeenCalled()
    expect(mockCreate).not.toHaveBeenCalled()
  })
})
