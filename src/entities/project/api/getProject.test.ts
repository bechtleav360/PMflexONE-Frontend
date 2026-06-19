import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'
import { proj1 } from '@/shared/test-utils/fixtures'

import { getProject } from './getProject'

const projectFixture = {
  id: proj1,
  name: 'Alpha',
  description: null,
  status: 'active',
  sizeClassification: 'medium',
  governanceStatus: 'formal',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  version: 1,
}

describe('getProject', () => {
  it('returns the project from the API response', async () => {
    server.use(
      graphql.query('GetProject', () => HttpResponse.json({ data: { project: projectFixture } })),
    )

    const result = await getProject(proj1)

    expect(result.id).toBe(proj1)
    expect(result.name).toBe('Alpha')
    expect(result.sizeClassification).toBe('medium')
  })

  it('throws when the API returns a GraphQL error', async () => {
    server.use(
      graphql.query('GetProject', () =>
        HttpResponse.json({ errors: [{ message: 'Not found' }] }, { status: 200 }),
      ),
    )

    await expect(getProject('proj-x')).rejects.toThrow()
  })
})
