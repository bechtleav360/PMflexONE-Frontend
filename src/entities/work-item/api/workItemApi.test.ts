import { describe, expect, it } from 'vitest'

import { proj1 } from '@/shared/test-utils/fixtures'

import {
  getWorkItemResponseSchema,
  getWorkItemsResponseSchema,
  personSchema,
  projectWorkItemSchema,
  workItemBaseSchema,
} from './workItemApi'

const validPerson = {
  id: 'user-1',
  firstName: 'Anna',
  lastName: 'Müller',
  mail: 'anna@example.com',
}

const validWorkItem = {
  id: 'wi-1',
  version: 1,
  name: 'Test task',
  description: null,
  status: 'OPEN',
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
}

describe('personSchema', () => {
  it('parses a valid person', () => {
    expect(personSchema.parse(validPerson)).toEqual(validPerson)
  })

  it('rejects missing id', () => {
    expect(() =>
      personSchema.parse({ ...validPerson, id: undefined } as Record<string, unknown>),
    ).toThrow()
  })

  it('accepts missing mail (mail is optional in the API)', () => {
    expect(() =>
      personSchema.parse({ ...validPerson, mail: undefined } as Record<string, unknown>),
    ).not.toThrow()
  })
})

describe('workItemBaseSchema', () => {
  it('parses a minimal valid work item', () => {
    const result = workItemBaseSchema.parse(validWorkItem)
    expect(result.id).toBe('wi-1')
    expect(result.archived).toBe(false)
  })

  it('parses a work item with all optional fields filled', () => {
    const full = {
      ...validWorkItem,
      description: 'A description',
      dueDate: '2026-06-01',
      priority: 'HIGH',
      assignee: validPerson,
      creator: validPerson,
      updater: validPerson,
      boardColumn: {
        id: 'col-1',
        version: 1,
        name: 'Open',
        workItemStatus: 'OPEN',
        position: 0,
        board: { id: 'board-1', name: 'Sprint Board' },
      },
      labels: [{ id: 'label-1', version: 1, name: 'Blocker', color: '#FFFF0000' }],
      scope: { id: proj1, name: 'Basisinfrastruktur' },
    }
    expect(() => workItemBaseSchema.parse(full)).not.toThrow()
  })

  it('rejects missing id', () => {
    expect(() =>
      workItemBaseSchema.parse({ ...validWorkItem, id: undefined } as Record<string, unknown>),
    ).toThrow()
  })

  it('rejects missing name', () => {
    expect(() =>
      workItemBaseSchema.parse({ ...validWorkItem, name: undefined } as Record<string, unknown>),
    ).toThrow()
  })

  it('rejects missing version', () => {
    expect(() =>
      workItemBaseSchema.parse({ ...validWorkItem, version: undefined } as Record<string, unknown>),
    ).toThrow()
  })

  it('rejects invalid priority value', () => {
    expect(() => workItemBaseSchema.parse({ ...validWorkItem, priority: 'urgent' })).toThrow()
  })

  it('rejects non-boolean archived', () => {
    expect(() => workItemBaseSchema.parse({ ...validWorkItem, archived: 'yes' })).toThrow()
  })
})

describe('projectWorkItemSchema', () => {
  it('parses a valid project work item', () => {
    const result = projectWorkItemSchema.parse(validWorkItem)
    expect(result.id).toBe('wi-1')
  })
})

describe('getWorkItemsResponseSchema', () => {
  it('parses a valid response with an array of work items', () => {
    const response = {
      workItems: [validWorkItem, { ...validWorkItem, id: 'wi-2', name: 'Second' }],
    }
    const result = getWorkItemsResponseSchema.parse(response)
    expect(result.workItems).toHaveLength(2)
  })

  it('parses an empty workItems array', () => {
    const result = getWorkItemsResponseSchema.parse({ workItems: [] })
    expect(result.workItems).toHaveLength(0)
  })

  it('rejects response without workItems key', () => {
    expect(() => getWorkItemsResponseSchema.parse({ items: [] })).toThrow()
  })

  it('rejects response where an item is missing required id', () => {
    expect(() =>
      getWorkItemsResponseSchema.parse({
        workItems: [{ ...validWorkItem, id: undefined }],
      } as Record<string, unknown>),
    ).toThrow()
  })
})

describe('getWorkItemResponseSchema', () => {
  it('parses a valid workItem response', () => {
    const full = { ...validWorkItem, comments: [], attachments: [], links: [] }
    const result = getWorkItemResponseSchema.parse({ workItem: full })
    expect(result.workItem?.id).toBe('wi-1')
  })

  it('parses a null workItem (not found)', () => {
    const result = getWorkItemResponseSchema.parse({ workItem: null })
    expect(result.workItem).toBeNull()
  })

  it('rejects response without workItem key', () => {
    expect(() => getWorkItemResponseSchema.parse({})).toThrow()
  })
})
