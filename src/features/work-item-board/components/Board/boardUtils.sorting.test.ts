import { beforeAll, describe, expect, it } from 'vitest'

import type { ProjectWorkItem } from '@/entities/work-item'
import { i18n } from '@/shared/lib/i18n'

import { applyFilter } from './boardUtils'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const fixtureLabel = {
  id: 'label-1',
  name: 'Bug',
  color: '#f00',
  version: 1,
  createdAt: '',
  updatedAt: '',
  metadata: null,
  creator: null,
  updater: null,
  scope: null,
}
const fixturePerson = {
  id: 'person-1',
  firstName: 'Alice',
  lastName: 'Smith',
  mail: 'alice@test.com',
}

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

// ── applyFilter ───────────────────────────────────────────────────────────────

describe('applyFilter', () => {
  it('returns all items when filter is empty', () => {
    const items = [makeWorkItem({ id: 'a' }), makeWorkItem({ id: 'b' })]
    expect(applyFilter(items, {})).toHaveLength(2)
  })

  it('filters by priority', () => {
    const items = [
      makeWorkItem({ id: 'a', priority: 'HIGH' }),
      makeWorkItem({ id: 'b', priority: 'LOW' }),
    ]
    const result = applyFilter(items, { priorities: new Set(['HIGH']) })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a')
  })

  it('includes null-priority items when "none" is in the priority filter', () => {
    const items = [
      makeWorkItem({ id: 'a', priority: null }),
      makeWorkItem({ id: 'b', priority: 'HIGH' }),
    ]
    const result = applyFilter(items, { priorities: new Set(['none']) })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a')
  })

  it('does not filter when priorities set is empty', () => {
    const items = [makeWorkItem({ id: 'a', priority: 'HIGH' })]
    const result = applyFilter(items, { priorities: new Set() })
    expect(result).toHaveLength(1)
  })

  it('filters by labelId', () => {
    const items = [
      makeWorkItem({ id: 'a', labels: [fixtureLabel] }),
      makeWorkItem({ id: 'b', labels: [] }),
    ]
    const result = applyFilter(items, { labelId: 'label-1' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a')
  })

  it('filters by assigneeId', () => {
    const items = [
      makeWorkItem({ id: 'a', assignee: fixturePerson }),
      makeWorkItem({ id: 'b', assignee: null }),
    ]
    const result = applyFilter(items, { assigneeId: 'person-1' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a')
  })

  it('applies multiple filters at once (AND logic)', () => {
    const items = [
      makeWorkItem({ id: 'match', priority: 'HIGH', assignee: fixturePerson }),
      makeWorkItem({ id: 'no-match', priority: 'HIGH', assignee: null }),
    ]
    const result = applyFilter(items, { priorities: new Set(['HIGH']), assigneeId: 'person-1' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('match')
  })
})
