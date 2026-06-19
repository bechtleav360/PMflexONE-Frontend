import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'
import { proj1 } from '@/shared/test-utils/fixtures'

import { updateBusinessCase } from './updateBusinessCaseApi'

const updatedBc = {
  id: 'bc-1',
  version: 2,
  status: 'draft',
  updatedAt: '2026-04-23T12:00:00Z',
  project: { id: proj1, name: 'Test Project' },
}

describe('updateBusinessCase', () => {
  it('returns the updated business case on success', async () => {
    server.use(
      graphql.mutation('UpdateBusinessCase', () =>
        HttpResponse.json({ data: { updateBusinessCase: updatedBc } }),
      ),
    )

    const result = await updateBusinessCase({ id: 'bc-1', version: 1 })

    expect(result.id).toBe('bc-1')
    expect(result.version).toBe(2)
    expect(result.status).toBe('draft')
    expect(result.project?.id).toBe(proj1)
  })

  it('includes optional content fields in the mutation', async () => {
    let capturedVariables: unknown
    server.use(
      graphql.mutation('UpdateBusinessCase', ({ variables }) => {
        capturedVariables = variables
        return HttpResponse.json({ data: { updateBusinessCase: updatedBc } })
      }),
    )

    await updateBusinessCase({
      id: 'bc-1',
      version: 1,
      clientSummary: 'Updated summary',
      timeline: 'Q3',
    })

    expect(capturedVariables).toMatchObject({
      input: { id: 'bc-1', version: 1, clientSummary: 'Updated summary', timeline: 'Q3' },
    })
  })

  it('throws when the API returns a GraphQL error', async () => {
    server.use(
      graphql.mutation('UpdateBusinessCase', () =>
        HttpResponse.json({ errors: [{ message: 'Version conflict' }] }, { status: 200 }),
      ),
    )

    await expect(updateBusinessCase({ id: 'bc-1', version: 1 })).rejects.toThrow()
  })
})
