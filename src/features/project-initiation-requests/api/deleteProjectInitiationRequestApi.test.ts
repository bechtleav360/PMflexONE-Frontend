import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { deleteProjectInitiationRequest } from './deleteProjectInitiationRequestApi'

describe('deleteProjectInitiationRequest', () => {
  it('resolves without a value on success', async () => {
    server.use(
      graphql.mutation('DeleteProjectInitiationRequest', () =>
        HttpResponse.json({ data: { deleteProjectInitiationRequest: true } }),
      ),
    )

    await expect(deleteProjectInitiationRequest('pir-1')).resolves.toBeUndefined()
  })

  it('throws when the API returns a GraphQL error', async () => {
    server.use(
      graphql.mutation('DeleteProjectInitiationRequest', () =>
        HttpResponse.json({ errors: [{ message: 'Not found' }] }, { status: 200 }),
      ),
    )

    await expect(deleteProjectInitiationRequest('pir-x')).rejects.toThrow()
  })
})
