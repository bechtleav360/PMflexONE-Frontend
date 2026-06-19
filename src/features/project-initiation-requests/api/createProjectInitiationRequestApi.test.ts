import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'
import { proj1 } from '@/shared/test-utils/fixtures'

import { createProjectInitiationRequest } from './createProjectInitiationRequestApi'

const createdPir = {
  id: 'pir-new',
  version: 1,
  name: 'Test PIR',
  documentVersion: null,
  status: 'draft',
  updatedAt: '2026-04-01T00:00:00Z',
  createdAt: '2026-04-01T00:00:00Z',
}

describe('createProjectInitiationRequest', () => {
  it('returns the created PIR on success', async () => {
    server.use(
      graphql.mutation('CreateProjectInitiationRequest', () =>
        HttpResponse.json({ data: { createProjectInitiationRequest: createdPir } }),
      ),
    )

    const result = await createProjectInitiationRequest({
      name: 'Test PIR',
      requestingProjectId: proj1,
      scopeId: 'prog-1',
      scopeType: 'Program',
    })

    expect(result.id).toBe('pir-new')
    expect(result.name).toBe('Test PIR')
    expect(result.status).toBe('draft')
    expect(result.version).toBe(1)
    expect(result.documentVersion).toBeNull()
  })

  it('throws when the API returns a GraphQL error', async () => {
    server.use(
      graphql.mutation('CreateProjectInitiationRequest', () =>
        HttpResponse.json({ errors: [{ message: 'Validation failed' }] }, { status: 200 }),
      ),
    )

    await expect(
      createProjectInitiationRequest({
        name: 'Fail',
        requestingProjectId: proj1,
        scopeId: 'prog-1',
        scopeType: 'Program',
      }),
    ).rejects.toThrow()
  })
})
