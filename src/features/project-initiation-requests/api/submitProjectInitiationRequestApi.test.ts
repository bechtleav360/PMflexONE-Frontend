import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { submitProjectInitiationRequest } from './submitProjectInitiationRequestApi'

const submittedPir = {
  id: 'pir-1',
  version: 2,
  name: 'Test PIR',
  status: 'accepted',
  updatedAt: '2026-04-02T00:00:00Z',
}

describe('submitProjectInitiationRequest', () => {
  it('returns the updated PIR on successful submission', async () => {
    server.use(
      graphql.mutation('SubmitProjectInitiationRequest', () =>
        HttpResponse.json({ data: { submitProjectInitiationRequest: submittedPir } }),
      ),
    )

    const result = await submitProjectInitiationRequest('pir-1', 1)

    expect(result.id).toBe('pir-1')
    expect(result.status).toBe('accepted')
    expect(result.version).toBe(2)
    expect(result.name).toBe('Test PIR')
  })

  it('throws when the API returns a GraphQL error', async () => {
    server.use(
      graphql.mutation('SubmitProjectInitiationRequest', () =>
        HttpResponse.json({ errors: [{ message: 'Version conflict' }] }, { status: 200 }),
      ),
    )

    await expect(submitProjectInitiationRequest('pir-x', 999)).rejects.toThrow()
  })
})
