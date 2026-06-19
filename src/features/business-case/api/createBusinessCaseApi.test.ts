import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'
import { proj1 } from '@/shared/test-utils/fixtures'

import { createBusinessCase } from './createBusinessCaseApi'

const createdBc = {
  id: 'bc-1',
  version: 1,
  status: 'draft',
  updatedAt: '2026-04-23T10:00:00Z',
  createdAt: '2026-04-23T10:00:00Z',
  project: { id: proj1, name: 'Test Project' },
}

describe('createBusinessCase', () => {
  it('returns the created business case on success', async () => {
    server.use(
      graphql.mutation('CreateBusinessCase', () =>
        HttpResponse.json({ data: { createBusinessCase: createdBc } }),
      ),
    )

    const result = await createBusinessCase({ projectId: proj1 })

    expect(result.id).toBe('bc-1')
    expect(result.version).toBe(1)
    expect(result.status).toBe('draft')
    expect(result.project?.id).toBe(proj1)
  })

  it('includes optional content fields in the mutation', async () => {
    let capturedVariables: unknown
    server.use(
      graphql.mutation('CreateBusinessCase', ({ variables }) => {
        capturedVariables = variables
        return HttpResponse.json({ data: { createBusinessCase: createdBc } })
      }),
    )

    await createBusinessCase({ projectId: proj1, clientSummary: 'Summary', keyRisks: 'Risks' })

    expect(capturedVariables).toMatchObject({
      input: { projectId: proj1, clientSummary: 'Summary', keyRisks: 'Risks' },
    })
  })

  it('throws when the API returns a GraphQL error', async () => {
    server.use(
      graphql.mutation('CreateBusinessCase', () =>
        HttpResponse.json(
          { errors: [{ message: 'A Business Case already exists for this project' }] },
          { status: 200 },
        ),
      ),
    )

    await expect(createBusinessCase({ projectId: proj1 })).rejects.toThrow()
  })
})
