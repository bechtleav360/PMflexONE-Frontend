import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { lookupBusinessCaseStatuses } from './lookupBusinessCaseStatuses'

const statusesPayload = [
  { status: 'draft', description: 'Draft', displayOrder: 1 },
  { status: 'submitted', description: 'Complete', displayOrder: 2 },
]

describe('lookupBusinessCaseStatuses', () => {
  it('returns parsed statuses from the API', async () => {
    server.use(
      graphql.query('BusinessCaseStatuses', () =>
        HttpResponse.json({ data: { businessCaseStatuses: statusesPayload } }),
      ),
    )

    const result = await lookupBusinessCaseStatuses()

    expect(result).toHaveLength(2)
    expect(result[0]?.status).toBe('draft')
    expect(result[0]?.description).toBe('Draft')
    expect(result[1]?.status).toBe('submitted')
  })

  it('throws when the API returns a GraphQL error', async () => {
    server.use(
      graphql.query('BusinessCaseStatuses', () =>
        HttpResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 200 }),
      ),
    )

    await expect(lookupBusinessCaseStatuses()).rejects.toThrow()
  })
})
