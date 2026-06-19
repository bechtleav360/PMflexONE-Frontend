import { graphql, HttpResponse } from 'msw'

import type { ProjectCharterNode } from '@/entities/project-charter'

/**
 * In-memory Project Charter store for MSW dev-mode mocking.
 * Seeded with one DRAFT charter (`pc-1`) linked to the canonical e2e project
 * `e2e00000-...-001` ("Kubernetes Rollout"), matching the seeded Business Case.
 */
const pcStore: (ProjectCharterNode & { projectId: string })[] = [
  {
    id: 'pc-1',
    version: 1,
    status: 'DRAFT',
    projectId: 'e2e00000-0000-0000-0000-000000000001',
    projectSummary: 'Das Projekt modernisiert die Rechnungslegung.',
    scopeSummary: 'Umfang: Kernprozesse der Finanzbuchhaltung.',
    successCriteria: 'Reduktion der Verarbeitungszeit um 30%.',
    stakeholders: 'Finanzabteilung, IT, Geschäftsleitung.',
    requirement: 'Vollständige DSGVO-Konformität.',
    projectConstraint: 'Budget: 450.000 € über 5 Jahre.',
    assumption: 'Ressourcen stehen ab Q3 2026 zur Verfügung.',
    risk: 'Verzögerungen durch fehlende Ressourcen.',
    resources: '3 Entwickler, 1 PM, 1 Fachexperte.',
    operationalImplementation: 'Übergang in Betrieb durch IT-Betrieb geplant.',
    createdAt: '2026-04-21T10:00:00Z',
    updatedAt: '2026-04-21T12:00:00Z',
    creator: { id: 'p-1', firstName: 'Max', lastName: 'Mustermann' },
    updater: { id: 'p-1', firstName: 'Max', lastName: 'Mustermann' },
    project: { id: 'e2e00000-0000-0000-0000-000000000001' },
  },
]

let nextPcId = 2

function buildNewCharter(
  projectId: string,
  input: Record<string, unknown>,
): ProjectCharterNode & { projectId: string } {
  const nStr = (k: string): string | null => (input[k] as string | undefined) ?? null
  return {
    id: `pc-${nextPcId++}`,
    version: 1,
    status: 'DRAFT',
    projectId,
    projectSummary: nStr('projectSummary'),
    scopeSummary: nStr('scopeSummary'),
    successCriteria: nStr('successCriteria'),
    stakeholders: nStr('stakeholders'),
    requirement: nStr('requirement'),
    projectConstraint: nStr('projectConstraint'),
    assumption: nStr('assumption'),
    risk: nStr('risk'),
    resources: nStr('resources'),
    operationalImplementation: nStr('operationalImplementation'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: null,
    updater: null,
    project: { id: projectId },
  }
}

const getProjectCharterHandler = graphql.query('GetProjectCharter', ({ variables }) => {
  const pc = pcStore.find((p) => p.id === (variables as { id: string }).id)
  if (!pc) {
    return HttpResponse.json({ errors: [{ message: 'ProjectCharter not found' }] }, { status: 200 })
  }
  return HttpResponse.json({ data: { projectCharter: pc } })
})

const getProjectCharterByProjectIdHandler = graphql.query(
  'GetProjectCharterByProjectId',
  ({ variables }) => {
    const { projectId } = variables as { projectId: string }
    const pc = pcStore.find((p) => p.projectId === projectId)
    return HttpResponse.json({
      data: {
        projectCharterByProjectId: pc ? { id: pc.id, status: pc.status } : null,
      },
    })
  },
)

const createProjectCharterHandler = graphql.mutation('CreateProjectCharter', ({ variables }) => {
  const input = (variables as { input: Record<string, unknown> }).input
  const projectId = input.projectId as string
  if (pcStore.some((p) => p.projectId === projectId)) {
    return HttpResponse.json(
      { errors: [{ message: 'A Project Charter already exists for this project' }] },
      { status: 200 },
    )
  }
  const newPc = buildNewCharter(projectId, input)
  pcStore.push(newPc)
  return HttpResponse.json({ data: { createProjectCharter: newPc } })
})

const updateProjectCharterHandler = graphql.mutation('UpdateProjectCharter', ({ variables }) => {
  const input = (variables as { input: Record<string, unknown> & { id: string; version: number } })
    .input
  const idx = pcStore.findIndex((p) => p.id === input.id)
  if (idx === -1) {
    return HttpResponse.json({ errors: [{ message: 'ProjectCharter not found' }] }, { status: 200 })
  }
  const existing = pcStore[idx]
  if (existing.version !== input.version) {
    return HttpResponse.json(
      { errors: [{ message: 'Version conflict — please refresh and retry' }] },
      { status: 200 },
    )
  }
  const updated = {
    ...existing,
    ...Object.fromEntries(Object.entries(input).filter(([k]) => k !== 'id' && k !== 'version')),
    version: existing.version + 1,
    updatedAt: new Date().toISOString(),
  }
  pcStore[idx] = updated
  return HttpResponse.json({ data: { updateProjectCharter: updated } })
})

const submitProjectCharterHandler = graphql.mutation('SubmitProjectCharter', ({ variables }) => {
  const input = (variables as { input: { id: string; version: number } }).input
  const idx = pcStore.findIndex((p) => p.id === input.id)
  if (idx === -1) {
    return HttpResponse.json({ errors: [{ message: 'ProjectCharter not found' }] }, { status: 200 })
  }
  const existing = pcStore[idx]
  if (existing.version !== input.version) {
    return HttpResponse.json(
      { errors: [{ message: 'Version conflict — please refresh and retry' }] },
      { status: 200 },
    )
  }
  if (existing.status === 'ACCEPTED') {
    return HttpResponse.json(
      { errors: [{ message: 'Charter is already ACCEPTED' }] },
      { status: 200 },
    )
  }
  const accepted = {
    ...existing,
    status: 'ACCEPTED' as const,
    version: existing.version + 1,
    updatedAt: new Date().toISOString(),
  }
  pcStore[idx] = accepted
  return HttpResponse.json({ data: { submitProjectCharter: accepted } })
})

/** MSW request handlers for all Project Charter GraphQL operations. */
export const projectCharterHandlers = [
  getProjectCharterHandler,
  getProjectCharterByProjectIdHandler,
  createProjectCharterHandler,
  updateProjectCharterHandler,
  submitProjectCharterHandler,
]
