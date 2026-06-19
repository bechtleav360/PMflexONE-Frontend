import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { lookupProjectInitiationRequestStatus } from './lookupProjectInitiationRequestStatus'

const statusPayload = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'accepted', label: 'Accepted' },
]

describe('lookupProjectInitiationRequestStatus', () => {
  it('returns parsed status labels from the API', async () => {
    server.use(
      graphql.query('LookupProjectInitiationRequestStatus', () =>
        HttpResponse.json({
          data: { lookupProjectInitiationRequestStatus: statusPayload },
        }),
      ),
    )

    const result = await lookupProjectInitiationRequestStatus()

    expect(result).toHaveLength(3)
    expect(result[0]?.value).toBe('draft')
    expect(result[0]?.label).toBe('Draft')
    expect(result[2]?.value).toBe('accepted')
  })

  it('throws when the API returns a GraphQL error', async () => {
    server.use(
      graphql.query('LookupProjectInitiationRequestStatus', () =>
        HttpResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 200 }),
      ),
    )

    await expect(lookupProjectInitiationRequestStatus()).rejects.toThrow()
  })
})
