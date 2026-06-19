import { graphql, HttpResponse } from 'msw'

import type { ProjectInitiationRequest } from '@/entities/project-initiation-request'

/**
 * In-memory PIR store for MSW dev-mode mocking.
 * Seeded to mirror the backend `E2eProjectInitiationRequestFixtures`: one PIR
 * per e2e project, named "PIR - <project name>".
 */
const pirStore: ProjectInitiationRequest[] = [
  {
    id: '22222222-2222-4222-8222-000000000001',
    version: 1,
    name: 'PIR - Kubernetes Rollout',
    documentVersion: '1.0',
    status: 'draft',
    projectInitiator: 'Max Mustermann',
    projectOwner: 'Abteilung IV',
    organizationalUnit: 'Referat IV/2',
    solutionProvider: null,
    approvalAuthority: null,
    requestDate: '2026-04-01',
    estimatedEffort: 120,
    estimatedEffortComment: 'Grobe Schätzung, inkl. Einführungsphase',
    targetDeliveryDate: '2026-12-31',
    deliveryType: 'internal',
    createdAt: '2026-04-01T08:00:00Z',
    updatedAt: '2026-04-15T14:30:00Z',
    creator: { id: 'p-1', firstName: 'Max', lastName: 'Mustermann', mail: 'max@example.de' },
    updater: { id: 'p-1', firstName: 'Max', lastName: 'Mustermann', mail: 'max@example.de' },
    requestingProject: {
      metadata: null,
      item: {
        id: 'e2e00000-0000-0000-0000-000000000001',
        name: 'Kubernetes Rollout',
        status: 'active',
      },
    },
    scope: null,
  },
  {
    id: '22222222-2222-4222-8222-000000000002',
    version: 3,
    name: 'PIR - Lakehouse Build-out',
    documentVersion: '2.0',
    status: 'accepted',
    projectInitiator: 'Erika Musterfrau',
    projectOwner: 'Abteilung II',
    organizationalUnit: 'Referat II/1',
    solutionProvider: 'IT-Dienstleister GmbH',
    approvalAuthority: 'Abteilungsleitung II',
    requestDate: '2026-02-10',
    estimatedEffort: 200,
    estimatedEffortComment: null,
    targetDeliveryDate: '2027-06-30',
    deliveryType: 'mixed',
    createdAt: '2026-02-10T09:00:00Z',
    updatedAt: '2026-03-01T11:00:00Z',
    creator: { id: 'p-2', firstName: 'Erika', lastName: 'Musterfrau', mail: 'erika@example.de' },
    updater: { id: 'p-2', firstName: 'Erika', lastName: 'Musterfrau', mail: 'erika@example.de' },
    requestingProject: {
      metadata: null,
      item: {
        id: '11111111-1111-4111-8111-000000000001',
        name: 'Lakehouse Build-out',
        status: 'active',
      },
    },
    scope: null,
  },
]

let nextPirId = 3

function buildNewPir(input: Record<string, unknown>): ProjectInitiationRequest {
  const nStr = (k: string): string | null => (input[k] as string | undefined) ?? null
  const rid = input.requestingProjectId as string | undefined
  return {
    id: `pir-${nextPirId++}`,
    version: 1,
    name: input.name as string,
    documentVersion: nStr('documentVersion'),
    status: 'draft',
    projectInitiator: nStr('projectInitiator'),
    projectOwner: nStr('projectOwner'),
    organizationalUnit: nStr('organizationalUnit'),
    solutionProvider: nStr('solutionProvider'),
    approvalAuthority: nStr('approvalAuthority'),
    requestDate: nStr('requestDate'),
    estimatedEffort: (input.estimatedEffort as number | undefined) ?? null,
    estimatedEffortComment: nStr('estimatedEffortComment'),
    targetDeliveryDate: nStr('targetDeliveryDate'),
    deliveryType: (input.deliveryType as ProjectInitiationRequest['deliveryType']) ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: null,
    updater: null,
    requestingProject: rid
      ? { metadata: null, item: { id: rid, name: 'Project', status: null } }
      : null,
    scope: null,
  }
}

const getProjectInitiationRequestsHandler = graphql.query('GetProjectInitiationRequests', () =>
  HttpResponse.json({ data: { projectInitiationRequests: pirStore } }),
)

const getProjectInitiationRequestHandler = graphql.query(
  'GetProjectInitiationRequest',
  ({ variables }) => {
    const pir = pirStore.find((p) => p.id === (variables as { id: string }).id)
    if (!pir) {
      return HttpResponse.json(
        { errors: [{ message: 'ProjectInitiationRequest not found' }] },
        { status: 200 },
      )
    }
    return HttpResponse.json({ data: { projectInitiationRequest: pir } })
  },
)

const lookupStatusHandler = graphql.query('LookupProjectInitiationRequestStatus', () =>
  HttpResponse.json({
    data: {
      lookupProjectInitiationRequestStatus: [
        { value: 'draft', label: 'Draft' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'accepted', label: 'Accepted' },
      ],
    },
  }),
)

const createProjectInitiationRequestHandler = graphql.mutation(
  'CreateProjectInitiationRequest',
  ({ variables }) => {
    const input = (variables as { input: Record<string, unknown> }).input
    const newPir = buildNewPir(input)
    pirStore.push(newPir)
    return HttpResponse.json({ data: { createProjectInitiationRequest: newPir } })
  },
)

const updateProjectInitiationRequestHandler = graphql.mutation(
  'UpdateProjectInitiationRequest',
  ({ variables }) => {
    const { id, input } = variables as {
      id: string
      input: Record<string, unknown> & { version: number }
    }
    const idx = pirStore.findIndex((p) => p.id === id)
    if (idx === -1) {
      return HttpResponse.json(
        { errors: [{ message: 'ProjectInitiationRequest not found' }] },
        { status: 200 },
      )
    }
    const existing = pirStore[idx]
    const updated: ProjectInitiationRequest = {
      ...existing,
      ...Object.fromEntries(Object.entries(input).filter(([k]) => k !== 'version')),
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    }
    pirStore[idx] = updated
    return HttpResponse.json({ data: { updateProjectInitiationRequest: updated } })
  },
)

const submitProjectInitiationRequestHandler = graphql.mutation(
  'SubmitProjectInitiationRequest',
  ({ variables }) => {
    const { id } = variables as { id: string; version: number }
    const idx = pirStore.findIndex((p) => p.id === id)
    if (idx === -1) {
      return HttpResponse.json(
        { errors: [{ message: 'ProjectInitiationRequest not found' }] },
        { status: 200 },
      )
    }
    const existing = pirStore[idx]
    const submitted: ProjectInitiationRequest = {
      ...existing,
      status: 'accepted',
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    }
    pirStore[idx] = submitted
    return HttpResponse.json({ data: { submitProjectInitiationRequest: submitted } })
  },
)

/** MSW handlers for all project-initiation-request GraphQL operations. */
export const projectInitiationRequestHandlers = [
  getProjectInitiationRequestsHandler,
  getProjectInitiationRequestHandler,
  lookupStatusHandler,
  createProjectInitiationRequestHandler,
  updateProjectInitiationRequestHandler,
  submitProjectInitiationRequestHandler,
]
