import { graphql, HttpResponse } from 'msw'

// ---------------------------------------------------------------------------
// In-memory store — replace with real backend by deleting this file
// ---------------------------------------------------------------------------

type PersonRecord = {
  id: string
  firstName: string
  lastName: string
  /** Null means no linked user account → person is inactive. */
  userId: string | null
}

const devPersons: PersonRecord[] = [
  { id: 'person-1', firstName: 'Anna', lastName: 'Müller', userId: 'user-1' },
  { id: 'person-2', firstName: 'Max', lastName: 'Schmidt', userId: 'user-2' },
  { id: 'person-3', firstName: 'Erika', lastName: 'Muster', userId: null },
]

type DeliverableRecord = {
  id: string
  version: number
  name: string
  businessId: string | null
  position: number
  createdAt: string
  updatedAt: string
  description: string | null
  otherInformation: string | null
  projectId: string
  parentId: string | null
  ownerId: string | null
}

let nextId = 100
let devDeliverables: DeliverableRecord[] = [
  {
    id: 'd-1',
    version: 1,
    name: 'Konzept',
    businessId: '1',
    position: 0,
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
    description: null,
    otherInformation: null,
    projectId: 'e2e00000-0000-0000-0000-000000000001',
    parentId: null,
    ownerId: null,
  },
  {
    id: 'd-2',
    version: 1,
    name: 'Analyse',
    businessId: '1.1',
    position: 0,
    createdAt: '2026-01-02T10:00:00Z',
    updatedAt: '2026-01-02T10:00:00Z',
    description: 'Anforderungsanalyse und Ist-Zustand',
    otherInformation: null,
    projectId: 'e2e00000-0000-0000-0000-000000000001',
    parentId: 'd-1',
    ownerId: null,
  },
  {
    id: 'd-3',
    version: 1,
    name: 'Designdokument',
    businessId: '1.2',
    position: 1,
    createdAt: '2026-01-03T10:00:00Z',
    updatedAt: '2026-01-03T10:00:00Z',
    description: null,
    otherInformation: null,
    projectId: 'e2e00000-0000-0000-0000-000000000001',
    parentId: 'd-1',
    ownerId: null,
  },
  {
    id: 'd-4',
    version: 1,
    name: 'Implementierung',
    businessId: '2',
    position: 1,
    createdAt: '2026-01-04T10:00:00Z',
    updatedAt: '2026-01-04T10:00:00Z',
    description: null,
    otherInformation: null,
    projectId: 'e2e00000-0000-0000-0000-000000000001',
    parentId: null,
    ownerId: null,
  },
]

// ---------------------------------------------------------------------------
// Shape helpers — map flat record → GQL edge shape
// ---------------------------------------------------------------------------

function toGqlNode(d: DeliverableRecord, all: DeliverableRecord[]) {
  const parent = d.parentId ? (all.find((x) => x.id === d.parentId) ?? null) : null
  const children = all.filter((x) => x.parentId === d.id)
  const ownerPerson = d.ownerId ? (devPersons.find((p) => p.id === d.ownerId) ?? null) : null
  return {
    id: d.id,
    version: d.version,
    name: d.name,
    businessId: d.businessId,
    position: d.position,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    parent: parent ? { node: { id: parent.id, name: parent.name } } : null,
    children: children.map((c) => ({ node: { id: c.id } })),
    owner: ownerPerson
      ? {
          node: {
            id: ownerPerson.id,
            firstName: ownerPerson.firstName,
            lastName: ownerPerson.lastName,
            userId: ownerPerson.userId,
          },
        }
      : null,
  }
}

function toGqlDetail(d: DeliverableRecord, all: DeliverableRecord[]) {
  return {
    ...toGqlNode(d, all),
    description: d.description,
    otherInformation: d.otherInformation,
  }
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

const getDeliverableTreeHandler = graphql.query('GetDeliverableTree', ({ variables }) => {
  const { projectId } = variables as { projectId: string }
  // Query sends scopeId: $projectId — the variable name is still "projectId" on the JS side
  const rows = devDeliverables.filter((d) => d.projectId === projectId)
  return HttpResponse.json({ data: { deliverables: rows.map((d) => toGqlNode(d, rows)) } })
})

const getDeliverableHandler = graphql.query('GetDeliverable', ({ variables }) => {
  const { id } = variables as { id: string }
  const found = devDeliverables.find((d) => d.id === id)
  if (!found) return HttpResponse.json({ data: { deliverables: [] } })
  return HttpResponse.json({ data: { deliverables: [toGqlDetail(found, devDeliverables)] } })
})

const createDeliverableHandler = graphql.mutation('CreateDeliverable', ({ variables }) => {
  const input = (variables as { input: Record<string, unknown> }).input
  const now = new Date().toISOString()
  const newRecord: DeliverableRecord = {
    id: `d-${++nextId}`,
    version: 1,
    name: String(input.name ?? ''),
    businessId: (input.businessId as string | null) ?? null,
    position: devDeliverables.filter(
      (d) => d.parentId === ((input.parentId as string | null) ?? null),
    ).length,
    createdAt: now,
    updatedAt: now,
    description: (input.description as string | null) ?? null,
    otherInformation: (input.otherInformation as string | null) ?? null,
    projectId: String(input.scopeId ?? ''),
    parentId: (input.parentId as string | null) ?? null,
    ownerId: (input.ownerId as string | null) ?? null,
  }
  devDeliverables.push(newRecord)
  return HttpResponse.json({ data: { createDeliverable: toGqlNode(newRecord, devDeliverables) } })
})

// eslint-disable-next-line complexity -- MSW handler covers all update branches (parentId change, businessId dedup, reorder index patching); dev-only code, extraction would add noise without benefit
const updateDeliverableHandler = graphql.mutation('UpdateDeliverable', ({ variables }) => {
  const { id, input } = variables as { id: string; input: Record<string, unknown> }
  const idx = devDeliverables.findIndex((d) => d.id === id)
  if (idx === -1) return HttpResponse.json({ errors: [{ message: 'Not found' }] }, { status: 404 })
  const existing = devDeliverables[idx]
  const updated: DeliverableRecord = {
    ...existing,
    version: existing.version + 1,
    name: (input.name as string | undefined) ?? existing.name,
    businessId:
      'businessId' in input ? ((input.businessId as string | null) ?? null) : existing.businessId,
    ownerId: 'ownerId' in input ? ((input.ownerId as string | null) ?? null) : existing.ownerId,
    description:
      'description' in input
        ? ((input.description as string | null) ?? null)
        : existing.description,
    otherInformation:
      'otherInformation' in input
        ? ((input.otherInformation as string | null) ?? null)
        : existing.otherInformation,
    updatedAt: new Date().toISOString(),
  }
  devDeliverables[idx] = updated
  return HttpResponse.json({ data: { updateDeliverable: toGqlNode(updated, devDeliverables) } })
})

const moveDeliverableHandler = graphql.mutation('MoveDeliverable', ({ variables }) => {
  const { id, input } = variables as {
    id: string
    input: { version: number; newParentId?: string | null; newPosition: number }
  }
  const target = devDeliverables.find((d) => d.id === id)
  if (!target) return HttpResponse.json({ errors: [{ message: 'Not found' }] }, { status: 404 })

  const newParentId = 'newParentId' in input ? (input.newParentId ?? null) : target.parentId
  const now = new Date().toISOString()

  // 1. Remove target from old sibling group and renumber it
  const oldSiblings = devDeliverables
    .filter((d) => d.id !== id && d.parentId === target.parentId)
    .sort((a, b) => a.position - b.position)
  oldSiblings.forEach((s, i) => {
    const si = devDeliverables.findIndex((d) => d.id === s.id)
    if (si !== -1) devDeliverables[si] = { ...devDeliverables[si], position: i, updatedAt: now }
  })

  // 2. Insert target into new sibling group at requested position
  const newSiblings = devDeliverables
    .filter((d) => d.id !== id && d.parentId === newParentId)
    .sort((a, b) => a.position - b.position)

  const clampedPos = Math.max(0, Math.min(input.newPosition, newSiblings.length))
  newSiblings.splice(clampedPos, 0, target) // temporary, just to get final indices

  newSiblings.forEach((s, i) => {
    const si = devDeliverables.findIndex((d) => d.id === s.id)
    if (si !== -1) devDeliverables[si] = { ...devDeliverables[si], position: i, updatedAt: now }
  })

  // 3. Update the target itself
  const ti = devDeliverables.findIndex((d) => d.id === id)
  devDeliverables[ti] = {
    ...devDeliverables[ti],
    version: devDeliverables[ti].version + 1,
    parentId: newParentId,
    position: clampedPos,
    updatedAt: now,
  }

  const updated = devDeliverables[ti]
  const parentNode = updated.parentId
    ? devDeliverables.find((d) => d.id === updated.parentId)
    : null
  return HttpResponse.json({
    data: {
      moveDeliverable: {
        id: updated.id,
        version: updated.version,
        position: updated.position,
        parent: parentNode ? { node: { id: parentNode.id, name: parentNode.name } } : null,
      },
    },
  })
})

const deleteDeliverableHandler = graphql.mutation('DeleteDeliverable', ({ variables }) => {
  const { id } = variables as { id: string; version: number }
  const toDelete = new Set<string>()
  const collect = (nodeId: string) => {
    toDelete.add(nodeId)
    devDeliverables.filter((d) => d.parentId === nodeId).forEach((c) => collect(c.id))
  }
  collect(id)
  const deletedDescendantCount = toDelete.size - 1

  // Capture parent before deletion for sibling renumbering
  const deleted = devDeliverables.find((d) => d.id === id)
  const parentId = deleted?.parentId ?? null

  devDeliverables = devDeliverables.filter((d) => !toDelete.has(d.id))

  // Renumber remaining siblings to close the gap
  const now = new Date().toISOString()
  const remaining = devDeliverables
    .filter((d) => d.parentId === parentId)
    .sort((a, b) => a.position - b.position)
  remaining.forEach((s, i) => {
    const si = devDeliverables.findIndex((d) => d.id === s.id)
    if (si !== -1) devDeliverables[si] = { ...devDeliverables[si], position: i, updatedAt: now }
  })

  return HttpResponse.json({ data: { deleteDeliverable: { deletedDescendantCount } } })
})

const getPersonsHandler = graphql.query('GetPersons', () => {
  return HttpResponse.json({ data: { persons: devPersons } })
})

/**
 * MSW request handlers for the Deliverables Management feature.
 *
 * Simulates `GetDeliverableTree`, `GetDeliverable`, `CreateDeliverable`,
 * `UpdateDeliverable`, `MoveDeliverable`, `DeleteDeliverable`, and `GetPersons`
 * against an in-memory store. Remove this file when the real backend is connected.
 */
export const deliverablesHandlers = [
  getDeliverableTreeHandler,
  getDeliverableHandler,
  createDeliverableHandler,
  updateDeliverableHandler,
  moveDeliverableHandler,
  deleteDeliverableHandler,
  getPersonsHandler,
]
