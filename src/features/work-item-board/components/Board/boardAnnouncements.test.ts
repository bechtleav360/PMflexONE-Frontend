import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { createBoardAnnouncements } from './boardUtils'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

// ── createBoardAnnouncements ──────────────────────────────────────────────────

describe('createBoardAnnouncements', () => {
  it('returns an object with the four dnd event handlers', () => {
    const t = vi.fn((key: string) => key)
    const announcements = createBoardAnnouncements(t as never)
    expect(typeof announcements.onDragStart).toBe('function')
    expect(typeof announcements.onDragOver).toBe('function')
    expect(typeof announcements.onDragEnd).toBe('function')
    expect(typeof announcements.onDragCancel).toBe('function')
  })

  it('onDragStart calls t with dragStart key', () => {
    const t = vi.fn((key: string) => key)
    const { onDragStart } = createBoardAnnouncements(t as never)
    onDragStart({ active: { id: 'wi-1' } })
    expect(t).toHaveBeenCalledWith('features.workItem.board.dragStart', { id: 'wi-1' })
  })

  it('onDragOver with over target calls t with dragOver key', () => {
    const t = vi.fn((key: string) => key)
    const { onDragOver } = createBoardAnnouncements(t as never)
    onDragOver({ active: { id: 'wi-1' }, over: { id: 'col-2' } })
    expect(t).toHaveBeenCalledWith('features.workItem.board.dragOver', {
      id: 'wi-1',
      column: 'col-2',
    })
  })

  it('onDragOver with no over target calls t with dragOverNothing key', () => {
    const t = vi.fn((key: string) => key)
    const { onDragOver } = createBoardAnnouncements(t as never)
    onDragOver({ active: { id: 'wi-1' }, over: null })
    expect(t).toHaveBeenCalledWith('features.workItem.board.dragOverNothing', { id: 'wi-1' })
  })

  it('onDragEnd with over target calls t with dragEnd key', () => {
    const t = vi.fn((key: string) => key)
    const { onDragEnd } = createBoardAnnouncements(t as never)
    onDragEnd({ active: { id: 'wi-1' }, over: { id: 'col-2' } })
    expect(t).toHaveBeenCalledWith('features.workItem.board.dragEnd', {
      id: 'wi-1',
      column: 'col-2',
    })
  })

  it('onDragEnd with no over target calls t with dragCancelled key', () => {
    const t = vi.fn((key: string) => key)
    const { onDragEnd } = createBoardAnnouncements(t as never)
    onDragEnd({ active: { id: 'wi-1' }, over: null })
    expect(t).toHaveBeenCalledWith('features.workItem.board.dragCancelled', { id: 'wi-1' })
  })

  it('onDragCancel calls t with dragCancelled key', () => {
    const t = vi.fn((key: string) => key)
    const { onDragCancel } = createBoardAnnouncements(t as never)
    onDragCancel({ active: { id: 'wi-1' } })
    expect(t).toHaveBeenCalledWith('features.workItem.board.dragCancelled', { id: 'wi-1' })
  })
})
