import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'
import { proj1 } from '@/shared/test-utils/fixtures'

import { deleteProject } from './deleteProjectApi'

describe('deleteProject', () => {
  it('resolves without a value on success', async () => {
    await expect(deleteProject(proj1)).resolves.toBeUndefined()
  })

  it('throws when the API returns a GraphQL error', async () => {
    server.use(
      graphql.mutation('DeleteProject', () =>
        HttpResponse.json({ errors: [{ message: 'Not found' }] }, { status: 200 }),
      ),
    )

    await expect(deleteProject('proj-x')).rejects.toThrow()
  })
})
