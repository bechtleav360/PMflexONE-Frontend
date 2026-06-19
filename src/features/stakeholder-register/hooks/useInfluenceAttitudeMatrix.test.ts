import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { MatrixPosition } from '@/entities/stakeholder'

import { useInfluenceAttitudeMatrix } from './useInfluenceAttitudeMatrix'

const pos = (x: number, y: number): MatrixPosition => ({ x, y })

describe('useInfluenceAttitudeMatrix', () => {
  it('initialises both positions from the initial value', () => {
    const initial = pos(0.8, 0.6)
    const { result } = renderHook(() => useInfluenceAttitudeMatrix(initial))
    expect(result.current.savedPosition).toEqual(initial)
    expect(result.current.pendingPosition).toEqual(initial)
  })

  it('initialises both positions to null when given null', () => {
    const { result } = renderHook(() => useInfluenceAttitudeMatrix(null))
    expect(result.current.savedPosition).toBeNull()
    expect(result.current.pendingPosition).toBeNull()
  })

  it('setPosition updates pendingPosition and clamps to [0,1]', () => {
    const { result } = renderHook(() => useInfluenceAttitudeMatrix(null))
    act(() => result.current.setPosition(0.3, 0.7))
    expect(result.current.pendingPosition).toEqual({ x: 0.3, y: 0.7 })
    expect(result.current.savedPosition).toBeNull()

    act(() => result.current.setPosition(1.5, -0.1))
    expect(result.current.pendingPosition).toEqual({ x: 1, y: 0 })
  })

  it('confirmPosition promotes pendingPosition to savedPosition', () => {
    const { result } = renderHook(() => useInfluenceAttitudeMatrix(null))
    act(() => result.current.setPosition(0.2, 0.9))
    act(() => result.current.confirmPosition())
    expect(result.current.savedPosition).toEqual({ x: 0.2, y: 0.9 })
  })

  it('cancelPosition resets pendingPosition to savedPosition', () => {
    const initial = pos(0.6, 0.6)
    const { result } = renderHook(() => useInfluenceAttitudeMatrix(initial))
    act(() => result.current.setPosition(0.1, 0.1))
    act(() => result.current.cancelPosition())
    expect(result.current.pendingPosition).toEqual(initial)
  })

  it('movePoint UP increases y', () => {
    const { result } = renderHook(() => useInfluenceAttitudeMatrix(pos(0.5, 0.5)))
    act(() => result.current.movePoint('up'))
    expect(result.current.pendingPosition?.y).toBeCloseTo(0.55)
  })

  it('movePoint DOWN decreases y', () => {
    const { result } = renderHook(() => useInfluenceAttitudeMatrix(pos(0.5, 0.5)))
    act(() => result.current.movePoint('down'))
    expect(result.current.pendingPosition?.y).toBeCloseTo(0.45)
  })

  it('movePoint RIGHT increases x', () => {
    const { result } = renderHook(() => useInfluenceAttitudeMatrix(pos(0.5, 0.5)))
    act(() => result.current.movePoint('right'))
    expect(result.current.pendingPosition?.x).toBeCloseTo(0.55)
  })

  it('movePoint LEFT decreases x', () => {
    const { result } = renderHook(() => useInfluenceAttitudeMatrix(pos(0.5, 0.5)))
    act(() => result.current.movePoint('left'))
    expect(result.current.pendingPosition?.x).toBeCloseTo(0.45)
  })

  it('movePoint clamps at 1.0 boundary', () => {
    const { result } = renderHook(() => useInfluenceAttitudeMatrix(pos(1.0, 1.0)))
    act(() => result.current.movePoint('up'))
    expect(result.current.pendingPosition?.y).toBe(1)
    act(() => result.current.movePoint('right'))
    expect(result.current.pendingPosition?.x).toBe(1)
  })

  it('movePoint clamps at 0.0 boundary', () => {
    const { result } = renderHook(() => useInfluenceAttitudeMatrix(pos(0.0, 0.0)))
    act(() => result.current.movePoint('down'))
    expect(result.current.pendingPosition?.y).toBe(0)
    act(() => result.current.movePoint('left'))
    expect(result.current.pendingPosition?.x).toBe(0)
  })

  it('movePoint with null position starts from centre (0.5, 0.5)', () => {
    const { result } = renderHook(() => useInfluenceAttitudeMatrix(null))
    act(() => result.current.movePoint('up'))
    expect(result.current.pendingPosition).toEqual({ x: 0.5, y: 0.55 })
  })

  it('movePoint returns the new position immediately', () => {
    const { result } = renderHook(() => useInfluenceAttitudeMatrix(pos(0.5, 0.5)))
    let returned: ReturnType<typeof result.current.movePoint>
    act(() => {
      returned = result.current.movePoint('right')
    })
    expect(returned!).toEqual({ x: 0.55, y: 0.5 })
  })
})
