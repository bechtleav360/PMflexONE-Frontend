import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'
import { proj1 } from '@/shared/test-utils/fixtures'

import { getProjectInitiationRequest } from './getProjectInitiationRequest'

const pirPayload = {
  id: 'pir-1',
  version: 1,
  name: 'Digitalisierung Rechnungswesen',
  documentVersion: '1.0',
  status: 'draft',
  projectInitiator: 'Max Mustermann',
  projectOwner: null,
  organizationalUnit: null,
  solutionProvider: null,
  approvalAuthority: null,
  requestDate: '2026-01-15',
  estimatedEffort: 120,
  estimatedEffortComment: null,
  targetDeliveryDate: '2026-12-31',
  deliveryType: 'internal',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
  creator: null,
  updater: null,
  requestingProject: { item: { id: proj1, name: 'Alpha', status: 'active' } },
  scope: null,
}

describe('getProjectInitiationRequest', () => {
  it('returns the PIR detail on success', async () => {
    server.use(
      graphql.query('GetProjectInitiationRequest', () =>
        HttpResponse.json({ data: { projectInitiationRequest: pirPayload } }),
      ),
    )

    const result = await getProjectInitiationRequest('pir-1')

    expect(result.id).toBe('pir-1')
    expect(result.name).toBe('Digitalisierung Rechnungswesen')
    expect(result.estimatedEffort).toBe(120)
    expect(result.requestingProject?.item.id).toBe(proj1)
  })

  it('throws when the API returns a GraphQL error', async () => {
    server.use(
      graphql.query('GetProjectInitiationRequest', () =>
        HttpResponse.json({ errors: [{ message: 'Not found' }] }, { status: 200 }),
      ),
    )

    await expect(getProjectInitiationRequest('pir-x')).rejects.toThrow()
  })
})
