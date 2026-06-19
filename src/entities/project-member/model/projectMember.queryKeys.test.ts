import { describe, expect, it } from 'vitest'

import { projectMemberQueryKeys } from './projectMember.queryKeys'

describe('projectMemberQueryKeys', () => {
  it('memberAssignments() returns a tuple containing the objectId', () => {
    const key = projectMemberQueryKeys.memberAssignments('obj-1')
    expect(key[0]).toBe('memberAssignments')
    expect(key[1]).toBe('obj-1')
  })

  it('memberAssignments() produces different keys for different objectIds', () => {
    const a = projectMemberQueryKeys.memberAssignments('obj-a')
    const b = projectMemberQueryKeys.memberAssignments('obj-b')
    expect(a).not.toEqual(b)
  })
})
