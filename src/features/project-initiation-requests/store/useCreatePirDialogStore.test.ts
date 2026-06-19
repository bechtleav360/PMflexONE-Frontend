import { act } from 'react'

import { afterEach, describe, expect, it } from 'vitest'

import { useCreatePirDialogStore } from './useCreatePirDialogStore'

afterEach(() => {
  act(() => useCreatePirDialogStore.getState().close())
})

describe('useCreatePirDialogStore', () => {
  it('starts with isOpen false', () => {
    expect(useCreatePirDialogStore.getState().isOpen).toBe(false)
  })

  it('open() sets isOpen to true', () => {
    act(() => useCreatePirDialogStore.getState().open())

    expect(useCreatePirDialogStore.getState().isOpen).toBe(true)
  })

  it('close() sets isOpen to false after opening', () => {
    act(() => {
      useCreatePirDialogStore.getState().open()
      useCreatePirDialogStore.getState().close()
    })

    expect(useCreatePirDialogStore.getState().isOpen).toBe(false)
  })
})
