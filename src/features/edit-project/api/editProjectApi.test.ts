import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { updateProject } from './editProjectApi'

const validInput = {
  name: 'Updated Name',
  sizeClassification: 'medium' as const,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  version: 1,
}

describe('updateProject', () => {
  it('resolves to the updated project on success', async () => {
    const result = await updateProject('e2e00000-0000-0000-0000-000000000001', validInput)

    expect(result).toMatchObject({
      id: 'e2e00000-0000-0000-0000-000000000001',
      name: 'Updated Name',
      sizeClassification: 'medium',
      version: 2,
    })
  })

  it('throws when the API returns a GraphQL error', async () => {
    server.use(
      graphql.mutation('UpdateProject', () =>
        HttpResponse.json({ errors: [{ message: 'Not found' }] }, { status: 200 }),
      ),
    )

    await expect(updateProject('proj-x', validInput)).rejects.toThrow()
  })
})
