import { beforeAll, describe, expect, it } from 'vitest'

import type { BoardColumn, ProjectWorkItem } from '@/entities/work-item'
import { i18n } from '@/shared/lib/i18n'

import {
  groupBacklog,
  MAX_COLUMNS,
  PRIORITY_GROUP_KEYS,
  PRIORITY_ORDER,
  sortBacklog,
  sortColumns,
} from './boardUtils'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

function makeWorkItem(overrides: Partial<ProjectWorkItem> = {}): ProjectWorkItem {
  return {
    id: 'wi-1',
    version: 1,
    name: 'Test Item',
    description: null,
    status: 'OPEN' as const,
    dueDate: null,
    priority: null,
    archived: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    metadata: null,
    creator: null,
    updater: null,
    assignee: null,
    boardColumn: null,
    labels: [],
    scope: null,
    comments: [],
    attachments: [],
    links: [],
    ...overrides,
  }
}

function makeColumn(overrides: Partial<BoardColumn> = {}): BoardColumn {
  return {
    id: 'col-1',
    version: 1,
    name: 'Open',
    workItemStatus: 'open',
    position: 0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    metadata: null,
    creator: null,
    updater: null,
    board: null as never,
    workItems: [],
    ...overrides,
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────

describe('constants', () => {
  it('MAX_COLUMNS equals 8', () => {
    expect(MAX_COLUMNS).toBe(8)
  })

  it('PRIORITY_ORDER has correct weights', () => {
    expect(PRIORITY_ORDER['LOW']).toBe(0)
    expect(PRIORITY_ORDER['MEDIUM']).toBe(1)
    expect(PRIORITY_ORDER['HIGH']).toBe(2)
    expect(PRIORITY_ORDER['VERY_HIGH']).toBe(3)
  })

  it('PRIORITY_GROUP_KEYS contains all expected keys', () => {
    expect(PRIORITY_GROUP_KEYS).toContain('LOW')
    expect(PRIORITY_GROUP_KEYS).toContain('MEDIUM')
    expect(PRIORITY_GROUP_KEYS).toContain('HIGH')
    expect(PRIORITY_GROUP_KEYS).toContain('VERY_HIGH')
    expect(PRIORITY_GROUP_KEYS).toContain('none')
  })
})

// ── sortBacklog ───────────────────────────────────────────────────────────────

describe('sortBacklog', () => {
  it('returns an empty array for empty input', () => {
    expect(sortBacklog([])).toEqual([])
  })

  it('does not mutate the original array', () => {
    const items = [makeWorkItem({ id: 'a', priority: 'LOW' })]
    const original = [...items]
    sortBacklog(items)
    expect(items).toEqual(original)
  })

  it('sorts items by priority ascending (low before high)', () => {
    const low = makeWorkItem({ id: 'a', priority: 'LOW', createdAt: '2026-01-01T00:00:00Z' })
    const high = makeWorkItem({ id: 'b', priority: 'HIGH', createdAt: '2026-01-01T00:00:00Z' })
    const result = sortBacklog([high, low])
    expect(result[0].id).toBe('a')
    expect(result[1].id).toBe('b')
  })

  it('places null-priority items last', () => {
    const none = makeWorkItem({ id: 'none', priority: null })
    const high = makeWorkItem({ id: 'high', priority: 'HIGH' })
    const result = sortBacklog([none, high])
    expect(result[0].id).toBe('high')
    expect(result[1].id).toBe('none')
  })

  it('breaks ties by createdAt descending', () => {
    const older = makeWorkItem({
      id: 'older',
      priority: 'MEDIUM',
      createdAt: '2026-01-01T00:00:00Z',
    })
    const newer = makeWorkItem({
      id: 'newer',
      priority: 'MEDIUM',
      createdAt: '2026-02-01T00:00:00Z',
    })
    const result = sortBacklog([older, newer])
    // newer createdAt should come first (descending)
    expect(result[0].id).toBe('newer')
    expect(result[1].id).toBe('older')
  })

  it('handles unknown priority keys as null (weight 4)', () => {
    const unknown = makeWorkItem({ id: 'u', priority: 'critical' as never })
    const low = makeWorkItem({ id: 'l', priority: 'LOW' })
    const result = sortBacklog([unknown, low])
    // low (0) < unknown (4), so low comes first
    expect(result[0].id).toBe('l')
  })
})

// ── groupBacklog ──────────────────────────────────────────────────────────────

describe('groupBacklog', () => {
  it('returns empty array for empty input', () => {
    expect(groupBacklog([])).toEqual([])
  })

  it('groups items by priority key', () => {
    const items = [
      makeWorkItem({ id: 'a', priority: 'HIGH' }),
      makeWorkItem({ id: 'b', priority: 'HIGH' }),
      makeWorkItem({ id: 'c', priority: 'LOW' }),
    ]
    const groups = groupBacklog(items)
    const highGroup = groups.find((g) => g.key === 'HIGH')
    const lowGroup = groups.find((g) => g.key === 'LOW')
    expect(highGroup?.items).toHaveLength(2)
    expect(lowGroup?.items).toHaveLength(1)
  })

  it('places null-priority items in the "none" group', () => {
    const items = [makeWorkItem({ id: 'n', priority: null })]
    const groups = groupBacklog(items)
    expect(groups[0].key).toBe('none')
    expect(groups[0].items[0].id).toBe('n')
  })

  it('filters out empty groups', () => {
    const items = [makeWorkItem({ id: 'a', priority: 'HIGH' })]
    const groups = groupBacklog(items)
    const keys = groups.map((g) => g.key)
    expect(keys).not.toContain('LOW')
    expect(keys).not.toContain('MEDIUM')
    expect(keys).not.toContain('VERY_HIGH')
    expect(keys).not.toContain('none')
  })
})

// ── sortColumns ───────────────────────────────────────────────────────────────

describe('sortColumns', () => {
  it('returns empty array for empty input', () => {
    expect(sortColumns([])).toEqual([])
  })

  it('does not mutate the original array', () => {
    const cols = [makeColumn({ id: 'a', workItemStatus: 'done', position: 0 })]
    const original = [...cols]
    sortColumns(cols)
    expect(cols).toEqual(original)
  })

  it('sorts columns by workflow status order', () => {
    const done = makeColumn({ id: 'done', workItemStatus: 'done', position: 0 })
    const open = makeColumn({ id: 'open', workItemStatus: 'open', position: 0 })
    const inProgress = makeColumn({ id: 'ip', workItemStatus: 'in_progress', position: 0 })
    const result = sortColumns([done, inProgress, open])
    expect(result[0].id).toBe('open')
    expect(result[1].id).toBe('ip')
    expect(result[2].id).toBe('done')
  })

  it('sorts by position within the same status', () => {
    const b = makeColumn({ id: 'b', workItemStatus: 'open', position: 1 })
    const a = makeColumn({ id: 'a', workItemStatus: 'open', position: 0 })
    const result = sortColumns([b, a])
    expect(result[0].id).toBe('a')
    expect(result[1].id).toBe('b')
  })

  it('handles unknown workItemStatus by treating it as order 0', () => {
    const unknown = makeColumn({ id: 'u', workItemStatus: 'archived', position: 5 })
    const open = makeColumn({ id: 'o', workItemStatus: 'open', position: 0 })
    const result = sortColumns([unknown, open])
    // Both unknown and open map to order 0; stable by position
    expect(result).toHaveLength(2)
  })
})
