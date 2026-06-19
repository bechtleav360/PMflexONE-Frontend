import { graphql, HttpResponse } from 'msw'

import type { Scope, StakeholderEntry, StrategyDescription } from '@/entities/stakeholder'

type ScopeKey = `${string}:${string}`

interface ScopeStore {
  scope: Scope
  entries: StakeholderEntry[]
  strategyDescription: StrategyDescription
}

const scopeStore = new Map<ScopeKey, ScopeStore>()

let nextEntryId = 1
let nextStrategyId = 1

function getOrCreate(scopeType: string, scopeId: string): ScopeStore {
  const key: ScopeKey = `${scopeType}:${scopeId}`
  if (!scopeStore.has(key)) {
    const scope: Scope = {
      id: scopeId,
      name: `${scopeType} ${scopeId}`,
      scopeType: scopeType as Scope['scopeType'],
    }
    const now = new Date().toISOString()
    scopeStore.set(key, {
      scope,
      entries: [],
      strategyDescription: {
        id: `strategy-${nextStrategyId++}`,
        version: 1,
        monitor: null,
        keepInformed: null,
        keepSatisfied: null,
        manageClosely: null,
        scope,
        createdAt: now,
        updatedAt: now,
      },
    })
  }
  return scopeStore.get(key)!
}

const getStakeholderEntriesHandler = graphql.query('GetStakeholderEntries', ({ variables }) => {
  const { filter } = variables as { filter: { scopeType: string; scopeId: string } }
  const store = getOrCreate(filter.scopeType, filter.scopeId)
  return HttpResponse.json({ data: { stakeholderEntries: store.entries } })
})

const getStrategyDescriptionHandler = graphql.query(
  'GetStakeholderStrategyDescription',
  ({ variables }) => {
    const { scopeType, scopeId } = variables as { scopeType: string; scopeId: string }
    const store = getOrCreate(scopeType, scopeId)
    return HttpResponse.json({
      data: { stakeholderStrategyDescription: store.strategyDescription },
    })
  },
)

const createStakeholderEntryHandler = graphql.mutation(
  'CreateStakeholderEntry',
  // eslint-disable-next-line complexity -- MSW handler mirrors mutation input shape; all branches are test scaffolding and cannot be reduced further
  ({ variables }) => {
    const { input } = variables as { input: Record<string, unknown> }
    const { scopeType, scopeId, ...fields } = input
    const store = getOrCreate(scopeType as string, scopeId as string)

    const now = new Date().toISOString()
    const entry: StakeholderEntry = {
      id: `entry-${nextEntryId++}`,
      version: 1,
      name: fields.name as string,
      role: fields.role as string,
      contactGroup: fields.contactGroup as StakeholderEntry['contactGroup'],
      email: (fields.email as string | null) ?? null,
      email2: (fields.email2 as string | null) ?? null,
      email3: (fields.email3 as string | null) ?? null,
      phone: (fields.phone as string | null) ?? null,
      phone2: (fields.phone2 as string | null) ?? null,
      phone3: (fields.phone3 as string | null) ?? null,
      preferredCommunicationType: (fields.preferredCommunicationType as string | null) ?? null,
      matrixPosition: (fields.matrixPosition as StakeholderEntry['matrixPosition']) ?? null,
      typeOfAffectedness:
        (fields.typeOfAffectedness as StakeholderEntry['typeOfAffectedness']) ?? null,
      conflictPotential:
        (fields.conflictPotential as StakeholderEntry['conflictPotential']) ?? null,
      expectations: (fields.expectations as string | null) ?? null,
      responsible: null,
      inclusionMeasures: (fields.inclusionMeasures as string | null) ?? null,
      linkedMember: null,
      behaviouralStrategy: null,
      scope: store.scope,
      logs: [],
      createdAt: now,
      updatedAt: now,
    }

    store.entries = [entry, ...store.entries]
    return HttpResponse.json({ data: { createStakeholderEntry: entry } })
  },
)

const updateStakeholderEntryHandler = graphql.mutation(
  'UpdateStakeholderEntry',
  ({ variables }) => {
    const { id, version, input } = variables as {
      id: string
      version: number
      input: Record<string, unknown>
    }

    for (const store of scopeStore.values()) {
      const idx = store.entries.findIndex((e) => e.id === id)
      if (idx !== -1) {
        const existing = store.entries[idx]
        if (existing.version !== version) {
          return HttpResponse.json({
            errors: [
              { message: 'Optimistic lock error', extensions: { code: 'OPTIMISTIC_LOCK_ERROR' } },
            ],
          })
        }
        const updated: StakeholderEntry = {
          ...existing,
          ...input,
          id,
          version: version + 1,
          scope: existing.scope,
          updatedAt: new Date().toISOString(),
        }
        store.entries[idx] = updated
        return HttpResponse.json({ data: { updateStakeholderEntry: updated } })
      }
    }

    return HttpResponse.json(
      { errors: [{ message: 'StakeholderEntry not found' }] },
      { status: 200 },
    )
  },
)

const deleteStakeholderEntryHandler = graphql.mutation(
  'DeleteStakeholderEntry',
  ({ variables }) => {
    const { input } = variables as { input: { id: string; version: number } }

    for (const store of scopeStore.values()) {
      const idx = store.entries.findIndex((e) => e.id === input.id)
      if (idx !== -1) {
        const existing = store.entries[idx]
        if (existing.version !== input.version) {
          return HttpResponse.json({
            errors: [
              { message: 'Optimistic lock error', extensions: { code: 'OPTIMISTIC_LOCK_ERROR' } },
            ],
          })
        }
        store.entries.splice(idx, 1)
        return HttpResponse.json({ data: { deleteStakeholderEntry: true } })
      }
    }

    return HttpResponse.json({ data: { deleteStakeholderEntry: false } })
  },
)

const upsertStrategyDescriptionHandler = graphql.mutation(
  'UpsertStakeholderStrategyDescription',
  ({ variables }) => {
    const { input } = variables as {
      input: { scopeType: string; scopeId: string } & Record<string, string | null>
    }
    const { scopeType, scopeId } = input
    const store = getOrCreate(scopeType, scopeId)
    store.strategyDescription = {
      ...store.strategyDescription,
      version: store.strategyDescription.version + 1,
      monitor: input.monitor ?? null,
      keepInformed: input.keepInformed ?? null,
      keepSatisfied: input.keepSatisfied ?? null,
      manageClosely: input.manageClosely ?? null,
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json({
      data: { upsertStakeholderStrategyDescription: store.strategyDescription },
    })
  },
)

const membersByPersonHandler = graphql.query('MembersByPerson', () => {
  const members = [
    {
      person: {
        id: 'mem-1',
        firstName: 'Anna',
        lastName: 'Müller',
        mail: 'anna.mueller@example.com',
      },
      roleAssignments: [{ role: { name: 'Projektleiter' } }],
    },
    {
      person: {
        id: 'mem-2',
        firstName: 'Ben',
        lastName: 'Schmidt',
        mail: 'ben.schmidt@example.com',
      },
      roleAssignments: [{ role: { name: 'Sponsor' } }, { role: { name: 'Genehmiger' } }],
    },
    {
      person: {
        id: 'mem-3',
        firstName: 'Clara',
        lastName: 'Weber',
        mail: 'clara.weber@example.com',
      },
      roleAssignments: [],
    },
  ]
  return HttpResponse.json({
    data: { membersByPerson: members },
  })
})

/** MSW request handlers for all stakeholder GraphQL operations. */
export const stakeholderHandlers = [
  getStakeholderEntriesHandler,
  getStrategyDescriptionHandler,
  createStakeholderEntryHandler,
  updateStakeholderEntryHandler,
  deleteStakeholderEntryHandler,
  upsertStrategyDescriptionHandler,
  membersByPersonHandler,
]
