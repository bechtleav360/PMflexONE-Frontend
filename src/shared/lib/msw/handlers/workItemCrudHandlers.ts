import { graphql, HttpResponse } from 'msw'

import {
  fixtureChangeHistory,
  fixtureComments,
  fixtureLabels,
  fixtureLookupBaseStatus,
  fixtureLookupPriority,
  fixtureLookupProjectStatus,
  fixturePersons,
  fixtureWorkItems,
  makeWorkItem,
  recordChange,
} from './workItemFixtures'

const TRACKED_FIELDS = ['name', 'description', 'status', 'dueDate', 'priority'] as const

function trackWorkItemFieldChanges(
  id: string,
  input: Record<string, unknown>,
  prev: Record<string, unknown>,
): void {
  for (const field of TRACKED_FIELDS) {
    if (field in input && String(input[field] ?? '') !== String(prev[field] ?? '')) {
      recordChange(id, field, prev[field], input[field])
    }
  }
}

function buildWorkItemPatch(input: Record<string, unknown>): Record<string, unknown> {
  return {
    ...(input.name !== undefined ? { name: String(input.name) } : {}),
    ...(input.description !== undefined
      ? { description: input.description != null ? String(input.description) : null }
      : {}),
    ...(input.status !== undefined ? { status: String(input.status) } : {}),
    ...(input.dueDate !== undefined
      ? { dueDate: input.dueDate != null ? String(input.dueDate) : null }
      : {}),
    ...(input.priority !== undefined
      ? { priority: input.priority != null ? String(input.priority) : null }
      : {}),
  }
}

/** MSW handlers for work-item queries and CRUD mutations. */
export const workItemCrudHandlers = [
  graphql.query('GetPersons', () => HttpResponse.json({ data: { persons: fixturePersons } })),

  graphql.query('WorkItems', ({ variables }) => {
    const filter = variables.filter as Record<string, unknown> | undefined
    let items = fixtureWorkItems
    if (filter?.archived !== undefined) items = items.filter((i) => i.archived === filter.archived)
    if (filter?.scopeId) items = items.filter((i) => i.scope?.id === filter.scopeId)
    return HttpResponse.json({ data: { workItems: items } })
  }),

  graphql.query('WorkItem', ({ variables }) =>
    HttpResponse.json({
      data: { workItem: fixtureWorkItems.find((i) => i.id === variables.id) ?? null },
    }),
  ),
  graphql.query('Labels', () => HttpResponse.json({ data: { labels: fixtureLabels } })),

  graphql.query('Comments', ({ variables }) =>
    HttpResponse.json({
      data: { comments: variables.workItemId === 'wi-2' ? fixtureComments : [] },
    }),
  ),
  graphql.query('LookupWorkItemBaseStatus', () =>
    HttpResponse.json({ data: { lookupWorkItemBaseStatus: fixtureLookupBaseStatus } }),
  ),
  graphql.query('LookupProjectWorkItemStatus', () =>
    HttpResponse.json({ data: { lookupProjectWorkItemStatus: fixtureLookupProjectStatus } }),
  ),
  graphql.query('LookupWorkItemPriority', () =>
    HttpResponse.json({ data: { lookupWorkItemPriority: fixtureLookupPriority } }),
  ),
  graphql.query('WorkItemChangeHistory', ({ variables }) => {
    const entries = fixtureChangeHistory.filter((e) => e.entityId === variables.workItemId)
    return HttpResponse.json({ data: { workItemChangeHistory: entries } })
  }),
  graphql.query('BoardChangeHistory', () =>
    HttpResponse.json({ data: { boardChangeHistory: [] } }),
  ),
  graphql.query('BoardColumnChangeHistory', () =>
    HttpResponse.json({ data: { boardColumnChangeHistory: [] } }),
  ),
  graphql.query('CommentChangeHistory', () =>
    HttpResponse.json({ data: { commentChangeHistory: [] } }),
  ),
  graphql.query('LabelChangeHistory', () =>
    HttpResponse.json({ data: { labelChangeHistory: [] } }),
  ),

  graphql.mutation('CreateProjectWorkItem', ({ variables }) => {
    const input = variables.input as Record<string, unknown>
    const newItem = makeWorkItem(`wi-${Date.now()}`, String(input.name ?? 'Unnamed'), 'OPEN', null)
    fixtureWorkItems.push(newItem)
    return HttpResponse.json({ data: { createProjectWorkItem: newItem } })
  }),

  graphql.mutation('UpdateProjectWorkItem', ({ variables }) => {
    const idx = fixtureWorkItems.findIndex((i) => i.id === variables.id)
    if (idx === -1)
      return HttpResponse.json({ errors: [{ message: 'Not found' }] }, { status: 404 })
    const input = variables.input as Record<string, unknown>
    trackWorkItemFieldChanges(
      String(variables.id),
      input,
      fixtureWorkItems[idx] as Record<string, unknown>,
    )
    fixtureWorkItems[idx] = {
      ...fixtureWorkItems[idx],
      ...buildWorkItemPatch(input),
      version: fixtureWorkItems[idx].version + 1,
    } as (typeof fixtureWorkItems)[number]
    return HttpResponse.json({ data: { updateProjectWorkItem: fixtureWorkItems[idx] } })
  }),

  graphql.mutation('DeleteProjectWorkItem', ({ variables }) => {
    const idx = fixtureWorkItems.findIndex((i) => i.id === variables.id)
    if (idx !== -1) fixtureWorkItems.splice(idx, 1)
    return HttpResponse.json({ data: { deleteProjectWorkItem: true } })
  }),

  graphql.mutation('ArchiveWorkItem', ({ variables }) => {
    const item = fixtureWorkItems.find((i) => i.id === variables.id)
    if (!item) return HttpResponse.json({ errors: [{ message: 'Not found' }] }, { status: 404 })
    recordChange(String(variables.id), 'archived', false, true)
    item.archived = true
    item.version += 1
    return HttpResponse.json({
      data: { archiveWorkItem: { id: item.id, version: item.version, archived: item.archived } },
    })
  }),

  graphql.mutation('UnarchiveWorkItem', ({ variables }) => {
    const item = fixtureWorkItems.find((i) => i.id === variables.id)
    if (!item) return HttpResponse.json({ errors: [{ message: 'Not found' }] }, { status: 404 })
    recordChange(String(variables.id), 'archived', true, false)
    item.archived = false
    item.version += 1
    return HttpResponse.json({
      data: { unarchiveWorkItem: { id: item.id, version: item.version, archived: item.archived } },
    })
  }),
]
