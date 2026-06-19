import { beforeEach, describe, expect, it } from 'vitest'

import { useCreateAssumptionDialogStore } from './useCreateAssumptionDialogStore'
import { useCreateConstraintDialogStore } from './useCreateConstraintDialogStore'
import { useCreateGoalDialogStore } from './useCreateGoalDialogStore'
import { useCreateRequirementDialogStore } from './useCreateRequirementDialogStore'
import { useEditAssumptionDialogStore } from './useEditAssumptionDialogStore'
import { useEditConstraintDialogStore } from './useEditConstraintDialogStore'
import { useEditGoalDialogStore } from './useEditGoalDialogStore'
import { useEditRequirementDialogStore } from './useEditRequirementDialogStore'

describe('useCreateGoalDialogStore', () => {
  beforeEach(() => {
    useCreateGoalDialogStore.setState({ isOpen: false })
  })

  it('starts closed', () => {
    expect(useCreateGoalDialogStore.getState().isOpen).toBe(false)
  })

  it('open sets isOpen to true', () => {
    useCreateGoalDialogStore.getState().open()
    expect(useCreateGoalDialogStore.getState().isOpen).toBe(true)
  })

  it('close sets isOpen to false', () => {
    useCreateGoalDialogStore.setState({ isOpen: true })
    useCreateGoalDialogStore.getState().close()
    expect(useCreateGoalDialogStore.getState().isOpen).toBe(false)
  })
})

describe('useEditGoalDialogStore', () => {
  beforeEach(() => {
    useEditGoalDialogStore.setState({ isOpen: false, goalId: null })
  })

  it('starts closed with no goalId', () => {
    const state = useEditGoalDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.goalId).toBeNull()
  })

  it('open sets isOpen and goalId', () => {
    useEditGoalDialogStore.getState().open('g-1')
    const state = useEditGoalDialogStore.getState()
    expect(state.isOpen).toBe(true)
    expect(state.goalId).toBe('g-1')
  })

  it('close resets isOpen and goalId', () => {
    useEditGoalDialogStore.setState({ isOpen: true, goalId: 'g-1' })
    useEditGoalDialogStore.getState().close()
    const state = useEditGoalDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.goalId).toBeNull()
  })
})

describe('useCreateRequirementDialogStore', () => {
  beforeEach(() => {
    useCreateRequirementDialogStore.setState({ isOpen: false })
  })

  it('starts closed', () => {
    expect(useCreateRequirementDialogStore.getState().isOpen).toBe(false)
  })

  it('open sets isOpen to true', () => {
    useCreateRequirementDialogStore.getState().open()
    expect(useCreateRequirementDialogStore.getState().isOpen).toBe(true)
  })

  it('close sets isOpen to false', () => {
    useCreateRequirementDialogStore.setState({ isOpen: true })
    useCreateRequirementDialogStore.getState().close()
    expect(useCreateRequirementDialogStore.getState().isOpen).toBe(false)
  })
})

describe('useEditRequirementDialogStore', () => {
  beforeEach(() => {
    useEditRequirementDialogStore.setState({ isOpen: false, requirementId: null })
  })

  it('starts closed with no requirementId', () => {
    const state = useEditRequirementDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.requirementId).toBeNull()
  })

  it('open sets isOpen and requirementId', () => {
    useEditRequirementDialogStore.getState().open('req-1')
    const state = useEditRequirementDialogStore.getState()
    expect(state.isOpen).toBe(true)
    expect(state.requirementId).toBe('req-1')
  })

  it('close resets isOpen and requirementId', () => {
    useEditRequirementDialogStore.setState({ isOpen: true, requirementId: 'req-1' })
    useEditRequirementDialogStore.getState().close()
    const state = useEditRequirementDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.requirementId).toBeNull()
  })
})

describe('useCreateAssumptionDialogStore', () => {
  beforeEach(() => {
    useCreateAssumptionDialogStore.setState({ isOpen: false })
  })

  it('starts closed', () => {
    expect(useCreateAssumptionDialogStore.getState().isOpen).toBe(false)
  })

  it('open sets isOpen to true', () => {
    useCreateAssumptionDialogStore.getState().open()
    expect(useCreateAssumptionDialogStore.getState().isOpen).toBe(true)
  })

  it('close sets isOpen to false', () => {
    useCreateAssumptionDialogStore.setState({ isOpen: true })
    useCreateAssumptionDialogStore.getState().close()
    expect(useCreateAssumptionDialogStore.getState().isOpen).toBe(false)
  })
})

describe('useEditAssumptionDialogStore', () => {
  beforeEach(() => {
    useEditAssumptionDialogStore.setState({ isOpen: false, assumptionId: null })
  })

  it('starts closed with no assumptionId', () => {
    const state = useEditAssumptionDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.assumptionId).toBeNull()
  })

  it('open sets isOpen and assumptionId', () => {
    useEditAssumptionDialogStore.getState().open('assump-1')
    const state = useEditAssumptionDialogStore.getState()
    expect(state.isOpen).toBe(true)
    expect(state.assumptionId).toBe('assump-1')
  })

  it('close resets isOpen and assumptionId', () => {
    useEditAssumptionDialogStore.setState({ isOpen: true, assumptionId: 'assump-1' })
    useEditAssumptionDialogStore.getState().close()
    const state = useEditAssumptionDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.assumptionId).toBeNull()
  })
})

describe('useCreateConstraintDialogStore', () => {
  beforeEach(() => {
    useCreateConstraintDialogStore.setState({ isOpen: false })
  })

  it('starts closed', () => {
    expect(useCreateConstraintDialogStore.getState().isOpen).toBe(false)
  })

  it('open sets isOpen to true', () => {
    useCreateConstraintDialogStore.getState().open()
    expect(useCreateConstraintDialogStore.getState().isOpen).toBe(true)
  })

  it('close sets isOpen to false', () => {
    useCreateConstraintDialogStore.setState({ isOpen: true })
    useCreateConstraintDialogStore.getState().close()
    expect(useCreateConstraintDialogStore.getState().isOpen).toBe(false)
  })
})

describe('useEditConstraintDialogStore', () => {
  beforeEach(() => {
    useEditConstraintDialogStore.setState({ isOpen: false, constraintId: null })
  })

  it('starts closed with no constraintId', () => {
    const state = useEditConstraintDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.constraintId).toBeNull()
  })

  it('open sets isOpen and constraintId', () => {
    useEditConstraintDialogStore.getState().open('c-1')
    const state = useEditConstraintDialogStore.getState()
    expect(state.isOpen).toBe(true)
    expect(state.constraintId).toBe('c-1')
  })

  it('close resets isOpen and constraintId', () => {
    useEditConstraintDialogStore.setState({ isOpen: true, constraintId: 'c-1' })
    useEditConstraintDialogStore.getState().close()
    const state = useEditConstraintDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.constraintId).toBeNull()
  })
})
