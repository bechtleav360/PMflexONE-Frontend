import { beforeEach, describe, expect, it } from 'vitest'

import { useCreateIssueEntryDialogStore } from './useCreateIssueEntryDialogStore'
import { useCreateIssueFromRiskDialogStore } from './useCreateIssueFromRiskDialogStore'
import { useCreateProblemEntryDialogStore } from './useCreateProblemEntryDialogStore'
import { useCreateProblemFromIssueDialogStore } from './useCreateProblemFromIssueDialogStore'
import { useCreateRiskEntryDialogStore } from './useCreateRiskEntryDialogStore'
import { useEditIssueEntryDialogStore } from './useEditIssueEntryDialogStore'
import { useEditProblemEntryDialogStore } from './useEditProblemEntryDialogStore'
import { useEditRiskEntryDialogStore } from './useEditRiskEntryDialogStore'

describe('useCreateProblemEntryDialogStore', () => {
  beforeEach(() => {
    useCreateProblemEntryDialogStore.setState({ isOpen: false })
  })

  it('starts closed', () => {
    expect(useCreateProblemEntryDialogStore.getState().isOpen).toBe(false)
  })

  it('open sets isOpen to true', () => {
    useCreateProblemEntryDialogStore.getState().open()
    expect(useCreateProblemEntryDialogStore.getState().isOpen).toBe(true)
  })

  it('close sets isOpen to false', () => {
    useCreateProblemEntryDialogStore.setState({ isOpen: true })
    useCreateProblemEntryDialogStore.getState().close()
    expect(useCreateProblemEntryDialogStore.getState().isOpen).toBe(false)
  })
})

describe('useCreateRiskEntryDialogStore', () => {
  beforeEach(() => {
    useCreateRiskEntryDialogStore.setState({ isOpen: false })
  })

  it('starts closed', () => {
    expect(useCreateRiskEntryDialogStore.getState().isOpen).toBe(false)
  })

  it('open sets isOpen to true', () => {
    useCreateRiskEntryDialogStore.getState().open()
    expect(useCreateRiskEntryDialogStore.getState().isOpen).toBe(true)
  })

  it('close sets isOpen to false', () => {
    useCreateRiskEntryDialogStore.setState({ isOpen: true })
    useCreateRiskEntryDialogStore.getState().close()
    expect(useCreateRiskEntryDialogStore.getState().isOpen).toBe(false)
  })
})

describe('useEditProblemEntryDialogStore', () => {
  beforeEach(() => {
    useEditProblemEntryDialogStore.setState({ isOpen: false, entryId: null })
  })

  it('starts closed with no entryId', () => {
    const state = useEditProblemEntryDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.entryId).toBeNull()
  })

  it('open sets isOpen and entryId', () => {
    useEditProblemEntryDialogStore.getState().open('p-1')
    const state = useEditProblemEntryDialogStore.getState()
    expect(state.isOpen).toBe(true)
    expect(state.entryId).toBe('p-1')
  })

  it('close clears isOpen and entryId', () => {
    useEditProblemEntryDialogStore.setState({ isOpen: true, entryId: 'p-1' })
    useEditProblemEntryDialogStore.getState().close()
    const state = useEditProblemEntryDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.entryId).toBeNull()
  })
})

describe('useEditRiskEntryDialogStore', () => {
  beforeEach(() => {
    useEditRiskEntryDialogStore.setState({ isOpen: false, entryId: null })
  })

  it('starts closed with no entryId', () => {
    const state = useEditRiskEntryDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.entryId).toBeNull()
  })

  it('open sets isOpen and entryId', () => {
    useEditRiskEntryDialogStore.getState().open('r-1')
    const state = useEditRiskEntryDialogStore.getState()
    expect(state.isOpen).toBe(true)
    expect(state.entryId).toBe('r-1')
  })

  it('close clears isOpen and entryId', () => {
    useEditRiskEntryDialogStore.setState({ isOpen: true, entryId: 'r-1' })
    useEditRiskEntryDialogStore.getState().close()
    const state = useEditRiskEntryDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.entryId).toBeNull()
  })
})

describe('useCreateIssueEntryDialogStore', () => {
  beforeEach(() => {
    useCreateIssueEntryDialogStore.setState({ isOpen: false })
  })

  it('starts closed', () => {
    expect(useCreateIssueEntryDialogStore.getState().isOpen).toBe(false)
  })

  it('open sets isOpen to true', () => {
    useCreateIssueEntryDialogStore.getState().open()
    expect(useCreateIssueEntryDialogStore.getState().isOpen).toBe(true)
  })

  it('close sets isOpen to false', () => {
    useCreateIssueEntryDialogStore.setState({ isOpen: true })
    useCreateIssueEntryDialogStore.getState().close()
    expect(useCreateIssueEntryDialogStore.getState().isOpen).toBe(false)
  })
})

describe('useEditIssueEntryDialogStore', () => {
  beforeEach(() => {
    useEditIssueEntryDialogStore.setState({ isOpen: false, entryId: null })
  })

  it('starts closed with no entryId', () => {
    const state = useEditIssueEntryDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.entryId).toBeNull()
  })

  it('open sets isOpen and entryId', () => {
    useEditIssueEntryDialogStore.getState().open('i-1')
    const state = useEditIssueEntryDialogStore.getState()
    expect(state.isOpen).toBe(true)
    expect(state.entryId).toBe('i-1')
  })

  it('close clears isOpen and entryId', () => {
    useEditIssueEntryDialogStore.setState({ isOpen: true, entryId: 'i-1' })
    useEditIssueEntryDialogStore.getState().close()
    const state = useEditIssueEntryDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.entryId).toBeNull()
  })
})

describe('useCreateIssueFromRiskDialogStore', () => {
  beforeEach(() => {
    useCreateIssueFromRiskDialogStore.setState({
      isOpen: false,
      sourceRiskId: null,
      sourceRiskName: null,
      sourceRiskVersion: null,
    })
  })

  it('starts closed with no source risk context', () => {
    const state = useCreateIssueFromRiskDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.sourceRiskId).toBeNull()
    expect(state.sourceRiskName).toBeNull()
    expect(state.sourceRiskVersion).toBeNull()
  })

  it('open sets isOpen and stores all source risk fields', () => {
    useCreateIssueFromRiskDialogStore.getState().open('r-1', 'Budget risk', 3)
    const state = useCreateIssueFromRiskDialogStore.getState()
    expect(state.isOpen).toBe(true)
    expect(state.sourceRiskId).toBe('r-1')
    expect(state.sourceRiskName).toBe('Budget risk')
    expect(state.sourceRiskVersion).toBe(3)
  })

  it('close clears isOpen and all source risk fields', () => {
    useCreateIssueFromRiskDialogStore.setState({
      isOpen: true,
      sourceRiskId: 'r-1',
      sourceRiskName: 'Budget risk',
      sourceRiskVersion: 3,
    })
    useCreateIssueFromRiskDialogStore.getState().close()
    const state = useCreateIssueFromRiskDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.sourceRiskId).toBeNull()
    expect(state.sourceRiskName).toBeNull()
    expect(state.sourceRiskVersion).toBeNull()
  })
})

describe('useCreateProblemFromIssueDialogStore', () => {
  beforeEach(() => {
    useCreateProblemFromIssueDialogStore.setState({
      isOpen: false,
      sourceIssueId: null,
      sourceIssueName: null,
      sourceIssueVersion: null,
    })
  })

  it('starts closed with no source issue context', () => {
    const state = useCreateProblemFromIssueDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.sourceIssueId).toBeNull()
    expect(state.sourceIssueName).toBeNull()
    expect(state.sourceIssueVersion).toBeNull()
  })

  it('open sets isOpen and stores all source issue fields including version', () => {
    useCreateProblemFromIssueDialogStore.getState().open('i-1', 'Login outage', 2)
    const state = useCreateProblemFromIssueDialogStore.getState()
    expect(state.isOpen).toBe(true)
    expect(state.sourceIssueId).toBe('i-1')
    expect(state.sourceIssueName).toBe('Login outage')
    expect(state.sourceIssueVersion).toBe(2)
  })

  it('close clears isOpen and all source issue fields', () => {
    useCreateProblemFromIssueDialogStore.setState({
      isOpen: true,
      sourceIssueId: 'i-1',
      sourceIssueName: 'Login outage',
      sourceIssueVersion: 2,
    })
    useCreateProblemFromIssueDialogStore.getState().close()
    const state = useCreateProblemFromIssueDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.sourceIssueId).toBeNull()
    expect(state.sourceIssueName).toBeNull()
    expect(state.sourceIssueVersion).toBeNull()
  })
})
