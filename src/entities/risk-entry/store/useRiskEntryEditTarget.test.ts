import { beforeEach, describe, expect, it } from 'vitest'

import { useRiskEntryEditTarget } from './useRiskEntryEditTarget'

describe('useRiskEntryEditTarget', () => {
  beforeEach(() => {
    useRiskEntryEditTarget.setState({ editTargetId: null })
  })

  it('initial state: editTargetId is null', () => {
    expect(useRiskEntryEditTarget.getState().editTargetId).toBeNull()
  })

  it('setEditTarget sets editTargetId', () => {
    useRiskEntryEditTarget.getState().setEditTarget('abc')
    expect(useRiskEntryEditTarget.getState().editTargetId).toBe('abc')
  })

  it('clearEditTarget resets editTargetId to null', () => {
    useRiskEntryEditTarget.getState().setEditTarget('abc')
    useRiskEntryEditTarget.getState().clearEditTarget()
    expect(useRiskEntryEditTarget.getState().editTargetId).toBeNull()
  })

  it('multiple setEditTarget calls: last value wins', () => {
    useRiskEntryEditTarget.getState().setEditTarget('first')
    useRiskEntryEditTarget.getState().setEditTarget('second')
    useRiskEntryEditTarget.getState().setEditTarget('third')
    expect(useRiskEntryEditTarget.getState().editTargetId).toBe('third')
  })
})
