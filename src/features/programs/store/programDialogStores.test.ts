import { beforeEach, describe, expect, it } from 'vitest'

import type { Program } from '../types/program.types'
import { useCreateProgramDialogStore } from './useCreateProgramDialogStore'
import { useEditProgramDialogStore } from './useEditProgramDialogStore'

const sampleProgram: Program = {
  id: 'prog-1',
  version: 1,
  name: 'Test Program',
  status: 'active',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
}

beforeEach(() => {
  useCreateProgramDialogStore.setState({ isOpen: false, defaultPortfolioId: null })
  useEditProgramDialogStore.setState({ isOpen: false, program: null })
})

describe('useCreateProgramDialogStore', () => {
  it('starts closed with no portfolio', () => {
    const state = useCreateProgramDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.defaultPortfolioId).toBeNull()
  })

  it('open with a portfolioId sets isOpen and defaultPortfolioId', () => {
    useCreateProgramDialogStore.getState().open('port-1')
    const state = useCreateProgramDialogStore.getState()
    expect(state.isOpen).toBe(true)
    expect(state.defaultPortfolioId).toBe('port-1')
  })

  it('open without arguments sets isOpen true and defaultPortfolioId null', () => {
    useCreateProgramDialogStore.getState().open()
    const state = useCreateProgramDialogStore.getState()
    expect(state.isOpen).toBe(true)
    expect(state.defaultPortfolioId).toBeNull()
  })

  it('open with null sets defaultPortfolioId to null', () => {
    useCreateProgramDialogStore.getState().open(null)
    const state = useCreateProgramDialogStore.getState()
    expect(state.isOpen).toBe(true)
    expect(state.defaultPortfolioId).toBeNull()
  })

  it('close resets isOpen and defaultPortfolioId', () => {
    useCreateProgramDialogStore.getState().open('port-1')
    useCreateProgramDialogStore.getState().close()
    const state = useCreateProgramDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.defaultPortfolioId).toBeNull()
  })
})

describe('useEditProgramDialogStore', () => {
  it('starts closed with no program', () => {
    const state = useEditProgramDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.program).toBeNull()
  })

  it('open sets isOpen and stores the program', () => {
    useEditProgramDialogStore.getState().open(sampleProgram)
    const state = useEditProgramDialogStore.getState()
    expect(state.isOpen).toBe(true)
    expect(state.program).toEqual(sampleProgram)
  })

  it('close resets isOpen and program', () => {
    useEditProgramDialogStore.setState({ isOpen: true, program: sampleProgram })
    useEditProgramDialogStore.getState().close()
    const state = useEditProgramDialogStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.program).toBeNull()
  })
})
