import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'
import { proj1 } from '@/shared/test-utils/fixtures'

import { submitBusinessCase } from './submitBusinessCaseApi'

const submittedBc = {
  id: 'bc-1',
  version: 2,
  status: 'submitted',
  updatedAt: '2026-04-23T11:00:00Z',
  project: { id: proj1, name: 'Test Project' },
}

describe('submitBusinessCase', () => {
  it('returns the submitted business case on success', async () => {
    server.use(
      graphql.mutation('SubmitBusinessCase', () =>
        HttpResponse.json({ data: { submitBusinessCase: submittedBc } }),
      ),
    )

    const result = await submitBusinessCase({ id: 'bc-1', version: 1 })

    expect(result.id).toBe('bc-1')
    expect(result.version).toBe(2)
    expect(result.status).toBe('submitted')
    expect(result.project?.id).toBe(proj1)
  })

  it('throws when the API returns a GraphQL error', async () => {
    server.use(
      graphql.mutation('SubmitBusinessCase', () =>
        HttpResponse.json({ errors: [{ message: 'Version conflict' }] }, { status: 200 }),
      ),
    )

    await expect(submitBusinessCase({ id: 'bc-1', version: 1 })).rejects.toThrow()
  })
})
