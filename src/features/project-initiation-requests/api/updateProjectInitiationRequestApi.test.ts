import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { updateProjectInitiationRequest } from './updateProjectInitiationRequestApi'

const updatedPir = {
  id: 'pir-1',
  version: 2,
  name: 'Updated PIR',
  documentVersion: '1.1',
  status: 'draft',
  updatedAt: '2026-04-02T00:00:00Z',
}

describe('updateProjectInitiationRequest', () => {
  it('returns the updated PIR on success', async () => {
    server.use(
      graphql.mutation('UpdateProjectInitiationRequest', () =>
        HttpResponse.json({ data: { updateProjectInitiationRequest: updatedPir } }),
      ),
    )

    const result = await updateProjectInitiationRequest('pir-1', {
      version: 1,
      name: 'Updated PIR',
    })

    expect(result.id).toBe('pir-1')
    expect(result.name).toBe('Updated PIR')
    expect(result.version).toBe(2)
    expect(result.documentVersion).toBe('1.1')
  })

  it('throws when the API returns a GraphQL error', async () => {
    server.use(
      graphql.mutation('UpdateProjectInitiationRequest', () =>
        HttpResponse.json({ errors: [{ message: 'Version conflict' }] }, { status: 200 }),
      ),
    )

    await expect(updateProjectInitiationRequest('pir-x', { version: 999 })).rejects.toThrow()
  })
})
