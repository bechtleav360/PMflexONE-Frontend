// ─── Fixture data for MSW work-item handlers ──────────────────────────────────

/**
 * Creates a minimal person fixture for use in MSW handler responses.
 * @param id - Person ID.
 * @param firstName - First name.
 * @param lastName - Last name.
 * @param mail - Email address.
 * @returns A person fixture object.
 */
export const fixturePerson = (id: string, firstName: string, lastName: string, mail: string) => ({
  id,
  firstName,
  lastName,
  mail,
})

/** Shared project scope fixture used across work-item handlers. */
export const fixtureScope = {
  id: 'e2e00000-0000-0000-0000-000000000001',
  name: 'Kubernetes Rollout',
}

/** Sample labels for work-item handler fixtures. */
export const fixtureLabels = [
  {
    id: 'label-1',
    version: 1,
    name: 'Blocker',
    color: '#FFFF0000',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    metadata: null,
    creator: null,
    updater: null,
    scope: fixtureScope,
  },
  {
    id: 'label-2',
    version: 1,
    name: 'Enhancement',
    color: '#FF0077CC',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    metadata: null,
    creator: null,
    updater: null,
    scope: fixtureScope,
  },
]

/** Sprint board fixture with three columns used by MSW board handlers. */
export const fixtureBoard = {
  id: 'board-1',
  version: 1,
  name: 'Sprint Board',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  metadata: null,
  creator: null,
  updater: null,
  scope: fixtureScope,
  columns: [
    {
      id: 'col-1',
      version: 1,
      name: 'Open',
      workItemStatus: 'open',
      position: 0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      board: { id: 'board-1', name: 'Sprint Board' },
      workItems: [] as never[],
    },
    {
      id: 'col-2',
      version: 1,
      name: 'In Progress',
      workItemStatus: 'in_progress',
      position: 1,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      board: { id: 'board-1', name: 'Sprint Board' },
      workItems: [] as never[],
    },
    {
      id: 'col-3',
      version: 1,
      name: 'Done',
      workItemStatus: 'done',
      position: 2,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      board: { id: 'board-1', name: 'Sprint Board' },
      workItems: [] as never[],
    },
  ],
}

/**
 * Builds a minimal work-item fixture object for MSW handler responses.
 * @param id - Work item ID.
 * @param name - Display name of the work item.
 * @param status - Status string.
 * @param boardColumnId - Column ID to assign, or null for pool items.
 * @returns A work-item fixture object.
 */
export const makeWorkItem = (
  id: string,
  name: string,
  status: string,
  boardColumnId: string | null,
) => ({
  id,
  version: 1,
  name,
  description: null,
  status,
  dueDate: null,
  priority: null,
  archived: false,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
  metadata: null,
  creator: fixturePerson('user-1', 'Anna', 'Müller', 'anna.mueller@example.com'),
  updater: null,
  assignee: null,
  boardColumn: boardColumnId
    ? (() => {
        const col = fixtureBoard.columns.find((c) => c.id === boardColumnId)
        if (!col) return null
        const { workItems: _wi, ...colWithoutItems } = col
        return colWithoutItems
      })()
    : null,
  labels: [] as never[],
  comments: [] as never[],
  attachments: [] as never[],
  links: [] as Array<{
    edgeTypeName: string | null
    metadata: string | null
    item: Record<string, unknown> | null
  }>,
  scope: fixtureScope,
})

/** Pre-built set of work items covering open, in-progress, and done states. */
export const fixtureWorkItems = [
  makeWorkItem('wi-1', 'Infrastruktur aufbauen', 'OPEN', null),
  makeWorkItem('wi-2', 'API-Integration testen', 'IN_PROGRESS', 'col-2'),
  makeWorkItem('wi-3', 'Deployment abgeschlossen', 'DONE', 'col-3'),
]

// Assign board work items
fixtureBoard.columns[1].workItems = [fixtureWorkItems[1] as never]
fixtureBoard.columns[2].workItems = [fixtureWorkItems[2] as never]

/** Sample comment thread for work-item MSW handler fixtures. */
export const fixtureComments = [
  {
    id: 'comment-1',
    version: 1,
    text: '**Status**: Begonnen. Benötige Zugang zum Cluster.',
    createdAt: '2026-01-15T11:00:00Z',
    updatedAt: '2026-01-15T11:00:00Z',
    metadata: null,
    author: fixturePerson('user-1', 'Anna', 'Müller', 'anna.mueller@example.com'),
    attachments: [],
  },
  {
    id: 'comment-2',
    version: 1,
    text: 'Zugang wurde erteilt.',
    createdAt: '2026-01-15T12:00:00Z',
    updatedAt: '2026-01-15T12:00:00Z',
    metadata: null,
    author: fixturePerson('user-2', 'Ben', 'Schmidt', 'ben.schmidt@example.com'),
    attachments: [],
  },
]

/** Base work-item status lookup values shared across scope types. */
export const fixtureLookupBaseStatus = [
  { value: 'open', label: 'Offen' },
  { value: 'in_progress', label: 'In Bearbeitung' },
  { value: 'done', label: 'Erledigt' },
]

/** Project-specific status lookup values extending the base set. */
export const fixtureLookupProjectStatus = [
  ...fixtureLookupBaseStatus,
  { value: 'rejected', label: 'Abgelehnt' },
]

/** Priority lookup values for work-item fixture handlers. */
export const fixtureLookupPriority = [
  { value: 'low', label: 'Niedrig' },
  { value: 'medium', label: 'Mittel' },
  { value: 'high', label: 'Hoch' },
  { value: 'very_high', label: 'Sehr hoch' },
]

/** Sample persons list for work-item assignment fixtures. */
export const fixturePersons = [
  fixturePerson('user-1', 'Anna', 'Müller', 'anna.mueller@example.com'),
  fixturePerson('user-2', 'Thomas', 'Berger', 'thomas.berger@example.com'),
  fixturePerson('user-3', 'Lisa', 'Weber', 'lisa.weber@example.com'),
]

/** Shape of a change-history record used by MSW fixture handlers. */
export interface FixtureHistoryEntry {
  id: string
  entityType: string
  entityId: string
  changedField: string
  oldValue: string | null
  newValue: string | null
  changedAt: string
  changedBy: ReturnType<typeof fixturePerson> | null
}

/** In-memory store for change history entries recorded during MSW session. */
export const fixtureChangeHistory: FixtureHistoryEntry[] = []

let _historyCounter = 0

/**
 * Records a field-level change for a work item into the in-memory history store.
 * @param entityId - ID of the entity that was changed.
 * @param field - Name of the field that changed.
 * @param oldValue - Previous field value (coerced to string, or null).
 * @param newValue - New field value (coerced to string, or null).
 */
export function recordChange(
  entityId: string,
  field: string,
  oldValue: unknown,
  newValue: unknown,
): void {
  fixtureChangeHistory.push({
    id: `hist-${++_historyCounter}`,
    entityType: 'workItem',
    entityId,
    changedField: field,
    oldValue: oldValue != null ? String(oldValue) : null,
    newValue: newValue != null ? String(newValue) : null,
    changedAt: new Date().toISOString(),
    changedBy: fixturePerson('user-1', 'Anna', 'Müller', 'anna.mueller@example.com'),
  })
}
