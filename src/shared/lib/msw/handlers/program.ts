import { graphql, HttpResponse } from 'msw'

import type { ProgramPerson, ProgramPortfolioEdge, ProgramProjectEdge } from '@/features/programs'

interface DevProgram {
  id: string
  version: number
  name: string
  status: string
  createdAt: string
  updatedAt: string
  metadata: string | null
  creator: ProgramPerson | null
  updater: ProgramPerson | null
  portfolio: ProgramPortfolioEdge | null
  projects: ProgramProjectEdge[]
}

/** Lookup map for portfolio names (mirrors the seeded portfolios in portfolio.ts). */
const portfolioNames: Record<string, string> = {
  'portfolio-1': 'Digital Transformation 2026',
  // Canonical e2e portfolio (matches backend E2ePortfolioFixtures).
  'e2e00000-0000-0000-0000-000000000002': 'Digital Transformation',
}

/**
 * In-memory program store for MSW dev-mode mocking.
 * Seeded with two example programs; updated by create/update mutations.
 */
export const devPrograms: DevProgram[] = [
  {
    id: 'e2e00000-0000-0000-0000-000000000001',
    version: 0,
    name: 'Digital Core Platform',
    status: 'active',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
    metadata: null,
    portfolio: { item: { id: 'portfolio-1', name: 'Digital Transformation 2026' } },
    creator: { id: 'user-1', firstName: 'Admin', lastName: 'User' },
    updater: { id: 'user-1', firstName: 'Admin', lastName: 'User' },
    projects: [{ item: { id: 'proj-1', name: 'Project Alpha', status: 'active' } }],
  },
  {
    id: 'e2e00000-0000-0000-0000-000000000002',
    version: 0,
    name: 'Cloud Migration Initiative',
    status: 'draft',
    createdAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-02-20T14:00:00Z',
    metadata: null,
    portfolio: null,
    creator: { id: 'user-1', firstName: 'Admin', lastName: 'User' },
    updater: { id: 'user-1', firstName: 'Admin', lastName: 'User' },
    projects: [],
  },
  // Programs under the canonical e2e portfolio (matches backend E2eProgramFixtures).
  {
    id: 'e2e00000-0000-0000-0000-0000000000a1',
    version: 0,
    name: 'Cloud Migration',
    status: 'active',
    createdAt: '2026-01-20T08:00:00Z',
    updatedAt: '2026-01-20T08:00:00Z',
    metadata: null,
    portfolio: {
      item: { id: 'e2e00000-0000-0000-0000-000000000002', name: 'Digital Transformation' },
    },
    creator: { id: 'user-1', firstName: 'Admin', lastName: 'User' },
    updater: { id: 'user-1', firstName: 'Admin', lastName: 'User' },
    projects: [],
  },
  {
    id: 'e2e00000-0000-0000-0000-0000000000a2',
    version: 0,
    name: 'Data Platform',
    status: 'active',
    createdAt: '2026-01-21T08:00:00Z',
    updatedAt: '2026-01-21T08:00:00Z',
    metadata: null,
    portfolio: {
      item: { id: 'e2e00000-0000-0000-0000-000000000002', name: 'Digital Transformation' },
    },
    creator: { id: 'user-1', firstName: 'Admin', lastName: 'User' },
    updater: { id: 'user-1', firstName: 'Admin', lastName: 'User' },
    projects: [],
  },
]

const programStatuses = [
  { status: 'draft', description: 'Draft', displayOrder: 1 },
  { status: 'created', description: 'Created', displayOrder: 2 },
  { status: 'active', description: 'Active', displayOrder: 3 },
  { status: 'completed', description: 'Completed', displayOrder: 4 },
  { status: 'archived', description: 'Archived', displayOrder: 5 },
]

let nextProgramId = 3

const getProgramsHandler = graphql.query('GetPrograms', ({ variables }) => {
  const filter = (variables as { filter?: { portfolioId?: string } | null }).filter
  const rows = filter?.portfolioId
    ? devPrograms.filter((p) => p.portfolio?.item.id === filter.portfolioId)
    : devPrograms
  return HttpResponse.json({ data: { programs: rows } })
})

const getProgramHandler = graphql.query('GetProgram', ({ variables }) => {
  const { id } = variables as { id: string }
  const program = devPrograms.find((p) => p.id === id) ?? null
  return HttpResponse.json({ data: { program } })
})

const lookupProgramStatusHandler = graphql.query('LookupProgramStatus', () =>
  HttpResponse.json({ data: { lookupProgramStatus: programStatuses } }),
)

const getPortfolioProgramsHandler = graphql.query('GetPortfolioPrograms', ({ variables }) => {
  const { id } = variables as { id: string }
  const programs = devPrograms
    .filter((p) => p.portfolio?.item.id === id)
    .map((p) => ({
      item: {
        id: p.id,
        version: p.version,
        name: p.name,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      },
    }))
  return HttpResponse.json({ data: { portfolio: { programs } } })
})

const createProgramHandler = graphql.mutation('CreateProgram', ({ variables }) => {
  const { input } = variables as {
    input: { name: string; portfolioId: string | null; metadata: string | null }
  }

  const portfolio =
    input.portfolioId != null
      ? {
          item: {
            id: input.portfolioId,
            name: portfolioNames[input.portfolioId] ?? input.portfolioId,
          },
        }
      : null

  const newProgram: DevProgram = {
    id: `program-${nextProgramId++}`,
    version: 0,
    name: input.name,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: input.metadata,
    portfolio,
    creator: { id: 'user-1', firstName: 'Admin', lastName: 'User' },
    updater: { id: 'user-1', firstName: 'Admin', lastName: 'User' },
    projects: [],
  }

  devPrograms.push(newProgram)

  return HttpResponse.json({ data: { createProgram: newProgram } })
})

const updateProgramHandler = graphql.mutation('UpdateProgram', ({ variables }) => {
  const { id, input } = variables as {
    id: string
    input: {
      version: number
      name: string
      status: string
      portfolioId: string | null
      metadata: string | null
    }
  }

  const idx = devPrograms.findIndex((p) => p.id === id)
  if (idx === -1) {
    return HttpResponse.json({ errors: [{ message: `Program ${id} not found` }] }, { status: 200 })
  }

  const existing = devPrograms[idx]
  const portfolio =
    input.portfolioId != null
      ? {
          item: {
            id: input.portfolioId,
            name: portfolioNames[input.portfolioId] ?? input.portfolioId,
          },
        }
      : null

  const updated: DevProgram = {
    ...existing,
    version: existing.version + 1,
    name: input.name,
    status: input.status,
    updatedAt: new Date().toISOString(),
    metadata: input.metadata,
    portfolio,
  }

  devPrograms[idx] = updated

  return HttpResponse.json({ data: { updateProgram: updated } })
})

/** MSW handlers for all program-related GraphQL operations. */
export const programHandlers = [
  getProgramsHandler,
  getProgramHandler,
  lookupProgramStatusHandler,
  getPortfolioProgramsHandler,
  createProgramHandler,
  updateProgramHandler,
]
