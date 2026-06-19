import { graphql, HttpResponse } from 'msw'

import type { BusinessCaseNode, BusinessCaseStatus } from '@/entities/business-case'

/**
 * In-memory Business Case store for MSW dev-mode mocking.
 * Seeded with the fixed-UUID draft BC `e2e00000-...-005`, linked to the
 * canonical e2e project `e2e00000-...-001` ("Kubernetes Rollout"), matching
 * the backend `E2eBusinessCaseFixtures`.
 */
const bcStore: (BusinessCaseNode & { projectId: string })[] = [
  {
    id: 'e2e00000-0000-0000-0000-000000000005',
    version: 1,
    status: 'draft',
    projectId: 'e2e00000-0000-0000-0000-000000000001',
    clientSummary: 'Das Projekt modernisiert die Rechnungslegung.',
    projectRationale: 'Veraltete Systeme verursachen hohe Wartungskosten.',
    expectedBenefit: '30% Kostenreduktion im Betrieb.',
    options: 'A: Neuentwicklung. B: Kauf eines Standardprodukts.',
    investmentCalculation: 'Gesamtkosten: 450.000 € über 5 Jahre.',
    keyRisks: 'Verzögerungen durch fehlende Ressourcen.',
    expectedNegativeSideEffect: 'Umstellungsaufwand für Fachabteilungen.',
    timeline: 'Phase 1: Q3 2026. Phase 2: Q1 2027.',
    createdAt: '2026-04-21T10:00:00Z',
    updatedAt: '2026-04-21T12:00:00Z',
    metadata: null,
    creator: { id: 'p-1', firstName: 'Max', lastName: 'Mustermann', mail: 'max@example.de' },
    updater: { id: 'p-1', firstName: 'Max', lastName: 'Mustermann', mail: 'max@example.de' },
    project: { id: 'e2e00000-0000-0000-0000-000000000001', name: 'Kubernetes Rollout' },
  },
]

const statusDefinitions: BusinessCaseStatus[] = [
  { status: 'draft', description: 'Draft', displayOrder: 1 },
  { status: 'submitted', description: 'Complete', displayOrder: 2 },
]

let nextBcId = 2

const getBusinessCaseHandler = graphql.query('GetBusinessCase', ({ variables }) => {
  const bc = bcStore.find((b) => b.id === (variables as { id: string }).id)
  if (!bc) {
    return HttpResponse.json({ errors: [{ message: 'BusinessCase not found' }] }, { status: 200 })
  }
  return HttpResponse.json({ data: { businessCase: bc } })
})

const getBusinessCaseByProjectIdHandler = graphql.query(
  'GetBusinessCaseByProjectId',
  ({ variables }) => {
    const { projectId } = variables as { projectId: string }
    const bc = bcStore.find((b) => b.projectId === projectId)
    return HttpResponse.json({
      data: {
        businessCaseByProjectId: bc ? { id: bc.id, status: bc.status } : null,
      },
    })
  },
)

const businessCaseStatusesHandler = graphql.query('BusinessCaseStatuses', () =>
  HttpResponse.json({ data: { businessCaseStatuses: statusDefinitions } }),
)

const createBusinessCaseHandler = graphql.mutation('CreateBusinessCase', ({ variables }) => {
  const input = (variables as { input: Record<string, unknown> }).input
  const projectId = input.projectId as string

  const existing = bcStore.find((b) => b.projectId === projectId)
  if (existing) {
    return HttpResponse.json(
      { errors: [{ message: 'A Business Case already exists for this project' }] },
      { status: 200 },
    )
  }

  const newBc: BusinessCaseNode & { projectId: string } = {
    id: `bc-${nextBcId++}`,
    version: 1,
    status: 'draft',
    projectId,
    clientSummary: (input.clientSummary as string | undefined) ?? null,
    projectRationale: (input.projectRationale as string | undefined) ?? null,
    expectedBenefit: (input.expectedBenefit as string | undefined) ?? null,
    options: (input.options as string | undefined) ?? null,
    investmentCalculation: (input.investmentCalculation as string | undefined) ?? null,
    keyRisks: (input.keyRisks as string | undefined) ?? null,
    expectedNegativeSideEffect: (input.expectedNegativeSideEffect as string | undefined) ?? null,
    timeline: (input.timeline as string | undefined) ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: null,
    creator: null,
    updater: null,
    project: { id: projectId, name: 'Project' },
  }
  bcStore.push(newBc)
  return HttpResponse.json({ data: { createBusinessCase: newBc } })
})

const updateBusinessCaseHandler = graphql.mutation('UpdateBusinessCase', ({ variables }) => {
  const input = (variables as { input: Record<string, unknown> & { id: string; version: number } })
    .input
  const idx = bcStore.findIndex((b) => b.id === input.id)
  if (idx === -1) {
    return HttpResponse.json({ errors: [{ message: 'BusinessCase not found' }] }, { status: 200 })
  }
  const existing = bcStore[idx]
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
  bcStore[idx] = updated
  return HttpResponse.json({ data: { updateBusinessCase: updated } })
})

const submitBusinessCaseHandler = graphql.mutation('SubmitBusinessCase', ({ variables }) => {
  const input = (variables as { input: { id: string; version: number } }).input
  const idx = bcStore.findIndex((b) => b.id === input.id)
  if (idx === -1) {
    return HttpResponse.json({ errors: [{ message: 'BusinessCase not found' }] }, { status: 200 })
  }
  const existing = bcStore[idx]
  if (existing.version !== input.version) {
    return HttpResponse.json(
      { errors: [{ message: 'Version conflict — please refresh and retry' }] },
      { status: 200 },
    )
  }
  const submitted = {
    ...existing,
    status: 'submitted',
    version: existing.version + 1,
    updatedAt: new Date().toISOString(),
  }
  bcStore[idx] = submitted
  return HttpResponse.json({ data: { submitBusinessCase: submitted } })
})

/** MSW handlers for all Business Case GraphQL operations. */
export const businessCaseHandlers = [
  getBusinessCaseHandler,
  getBusinessCaseByProjectIdHandler,
  businessCaseStatusesHandler,
  createBusinessCaseHandler,
  updateBusinessCaseHandler,
  submitBusinessCaseHandler,
]
