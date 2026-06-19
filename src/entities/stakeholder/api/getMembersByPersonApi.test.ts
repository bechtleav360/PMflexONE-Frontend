import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { getMembersByPerson } from './getMembersByPersonApi'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const requestMock = vi.mocked(graphqlClient.request)

describe('getMembersByPerson', () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it('maps each person and exposes their role name(s)', async () => {
    requestMock.mockResolvedValue({
      membersByPerson: [
        {
          person: { id: 'mem-1', firstName: 'Anna', lastName: 'Müller', mail: 'a@x.de' },
          roleAssignments: [{ role: { name: 'Projektleiter' } }],
        },
      ],
    })

    const result = await getMembersByPerson('proj-1')

    expect(result).toEqual([
      {
        id: 'mem-1',
        firstName: 'Anna',
        lastName: 'Müller',
        mail: 'a@x.de',
        roleNames: ['Projektleiter'],
      },
    ])
  })

  it('dedupes repeated role names', async () => {
    requestMock.mockResolvedValue({
      membersByPerson: [
        {
          person: { id: 'mem-2', firstName: 'Ben', lastName: 'Schmidt', mail: null },
          roleAssignments: [
            { role: { name: 'Sponsor' } },
            { role: { name: 'Sponsor' } },
            { role: { name: 'Genehmiger' } },
          ],
        },
      ],
    })

    const result = await getMembersByPerson('proj-1')

    expect(result[0].roleNames).toEqual(['Sponsor', 'Genehmiger'])
  })

  it('returns an empty roleNames list when the member holds no role', async () => {
    requestMock.mockResolvedValue({
      membersByPerson: [
        {
          person: { id: 'mem-3', firstName: 'Clara', lastName: 'Weber', mail: null },
          roleAssignments: [],
        },
      ],
    })

    const result = await getMembersByPerson('proj-1')

    expect(result[0].roleNames).toEqual([])
  })
})
