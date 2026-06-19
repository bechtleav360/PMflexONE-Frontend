import { graphql, HttpResponse } from 'msw'

import type { ProjectSizeClassification } from '@/entities/project'
import { proj1 } from '@/shared/test-utils/fixtures'

type DevProject = {
  id: string
  name: string
  description: string | null
  status: string | null
  sizeClassification: ProjectSizeClassification | null
  governanceStatus: string | null
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
  version: number
}

const STORAGE_KEY = 'msw-dev-projects'
const STORAGE_NEXT_ID_KEY = 'msw-dev-next-id'

function saveProjectsToStorage(projects: DevProject[], id: number) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    sessionStorage.setItem(STORAGE_NEXT_ID_KEY, String(id))
  } catch {
    // sessionStorage unavailable (SSR/worker context) — ignore
  }
}

/**
 * In-memory project store for MSW dev-mode mocking.
 * Only used when the real backend is unavailable.
 * Loaded from sessionStorage on init so state survives same-session page reloads.
 */
const devProjects: DevProject[] = (() => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored) as DevProject[]
  } catch {
    // ignore
  }
  return [
    {
      // Fixed-UUID canonical e2e project (matches backend E2eProjectFixtures).
      id: proj1,
      name: 'Kubernetes Rollout',
      description: null,
      status: 'active',
      sizeClassification: 'large',
      governanceStatus: null,
      startDate: '2026-01-01',
      endDate: '2027-12-31',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      version: 1,
    },
    {
      // Dynamic-UUID e2e projects in the backend; mirrored here by name only.
      id: '11111111-1111-4111-8111-000000000001',
      name: 'Lakehouse Build-out',
      description: null,
      status: 'active',
      sizeClassification: 'large',
      governanceStatus: null,
      startDate: '2026-01-01',
      endDate: '2027-12-31',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      version: 1,
    },
    {
      id: '11111111-1111-4111-8111-000000000002',
      name: 'Invoice Automation',
      description: null,
      status: 'active',
      sizeClassification: 'medium',
      governanceStatus: null,
      startDate: '2026-01-01',
      endDate: '2027-06-30',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      version: 1,
    },
    {
      id: '11111111-1111-4111-8111-000000000003',
      name: 'Self-Service Portal',
      description: null,
      status: 'active',
      sizeClassification: 'medium',
      governanceStatus: null,
      startDate: '2026-01-01',
      endDate: '2027-06-30',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      version: 1,
    },
    {
      id: '11111111-1111-4111-8111-000000000004',
      name: 'Edge Switch Refresh',
      description: null,
      status: 'active',
      sizeClassification: 'small',
      governanceStatus: null,
      startDate: '2026-01-01',
      endDate: '2027-12-31',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      version: 1,
    },
  ]
})()

let nextId = (() => {
  try {
    const stored = sessionStorage.getItem(STORAGE_NEXT_ID_KEY)
    if (stored) return parseInt(stored, 10)
  } catch {
    // ignore
  }
  return 3
})()

const getProjectHandler = graphql.query('GetProject', ({ variables }) => {
  const { id } = variables as { id: string }
  const project = devProjects.find((p) => p.id === id) ?? null
  return HttpResponse.json({ data: { project } })
})

/**
 * Default MSW handler for the `ListProjects` query.
 * Returns the in-memory project list (updated by `CreateProject` mutations).
 */
const listProjectsHandler = graphql.query('ListProjects', () =>
  HttpResponse.json({
    data: { projects: devProjects },
  }),
)

/**
 * Default MSW handler for the `CreateProject` mutation.
 * Persists the new project to the in-memory store so it shows up in `ListProjects`.
 */
const createProjectHandler = graphql.mutation('CreateProject', ({ variables }) => {
  const input = (
    variables as {
      input: {
        name: string
        sizeClassification: ProjectSizeClassification
        startDate: string
        endDate: string
        description?: string
        creator: string
        updater: string
      }
    }
  ).input

  const now = new Date().toISOString()

  const newProject = {
    id: `proj-${nextId++}`,
    name: input.name,
    description: input.description ?? null,
    status: 'active',
    sizeClassification: input.sizeClassification,
    governanceStatus: null,
    startDate: input.startDate,
    endDate: input.endDate,
    createdAt: now,
    updatedAt: now,
    version: 1,
  }

  devProjects.push(newProject)
  saveProjectsToStorage(devProjects, nextId)

  return HttpResponse.json({ data: { createProject: newProject } })
})

/**
 * Default MSW handler for the `DeleteProject` mutation.
 * Removes the project from the in-memory store so subsequent ListProjects responses are consistent.
 */
const deleteProjectHandler = graphql.mutation('DeleteProject', ({ variables }) => {
  const { id } = variables as { id: string }
  const idx = devProjects.findIndex((p) => p.id === id)
  if (idx !== -1) {
    devProjects.splice(idx, 1)
    saveProjectsToStorage(devProjects, nextId)
  }
  return HttpResponse.json({ data: { deleteProject: true } })
})

/**
 * Default MSW handler for the `UpdateProject` mutation.
 * Returns the project with the applied input fields merged over the existing record.
 */
const updateProjectHandler = graphql.mutation('UpdateProject', ({ variables }) => {
  const { id, input } = variables as {
    id: string
    input: {
      name: string
      sizeClassification: ProjectSizeClassification
      startDate: string
      endDate: string
      description?: string
      version: number
    }
  }
  const existing = devProjects.find((p) => p.id === id)
  if (!existing) {
    return HttpResponse.json({ errors: [{ message: 'Project not found' }] }, { status: 200 })
  }
  const now = new Date().toISOString()
  return HttpResponse.json({
    data: {
      updateProject: {
        ...existing,
        name: input.name,
        sizeClassification: input.sizeClassification,
        startDate: input.startDate,
        endDate: input.endDate,
        description: input.description ?? existing.description,
        updatedAt: now,
        version: input.version + 1,
      },
    },
  })
})

/** MSW handlers for all project-related GraphQL operations. */
export const projectHandlers = [
  getProjectHandler,
  listProjectsHandler,
  createProjectHandler,
  deleteProjectHandler,
  updateProjectHandler,
]
