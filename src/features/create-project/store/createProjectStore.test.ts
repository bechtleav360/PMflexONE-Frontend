import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useCreateProjectStore } from './createProjectStore'

beforeEach(() => {
  useCreateProjectStore.setState({ open: false })
})

describe('useCreateProjectStore', () => {
  it('starts with modal closed', () => {
    const { result } = renderHook(() => useCreateProjectStore())
    expect(result.current.open).toBe(false)
  })

  it('opens the modal', () => {
    const { result } = renderHook(() => useCreateProjectStore())
    act(() => result.current.openModal())
    expect(result.current.open).toBe(true)
  })

  it('closes the modal', () => {
    useCreateProjectStore.setState({ open: true })
    const { result } = renderHook(() => useCreateProjectStore())
    act(() => result.current.closeModal())
    expect(result.current.open).toBe(false)
  })
})
