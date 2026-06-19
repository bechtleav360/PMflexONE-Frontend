import { describe, expect, it } from 'vitest'

import { roleQueryKeys } from './role.queryKeys'

describe('roleQueryKeys', () => {
  it('matrices() returns stable tuple', () => {
    expect(roleQueryKeys.matrices()).toEqual(['matrices'])
  })

  it('matrix() returns tuple containing the params object', () => {
    const params = { matrixId: 'm-1', domainType: 'PROJECT' as const, objectId: 'obj-1' }
    const key = roleQueryKeys.matrix(params)
    expect(key[0]).toBe('matrix')
    expect(key[1]).toEqual(params)
  })

  it('matrix() with undefined fields still returns a tuple', () => {
    const key = roleQueryKeys.matrix({})
    expect(key[0]).toBe('matrix')
  })

  it('roleGroups() returns stable tuple', () => {
    expect(roleQueryKeys.roleGroups()).toEqual(['roleGroups'])
  })

  it('taskGroups() returns stable tuple', () => {
    expect(roleQueryKeys.taskGroups()).toEqual(['taskGroups'])
  })

  it('userPermissions() includes resources and objectId in tuple', () => {
    const key = roleQueryKeys.userPermissions(['res:read'], 'obj-42')
    expect(key[0]).toBe('userPermissions')
    expect(key[1]).toEqual(['res:read'])
    expect(key[2]).toBe('obj-42')
  })

  it('userPermissions() falls back to null when objectId is omitted', () => {
    const key = roleQueryKeys.userPermissions(['res:read'])
    expect(key[2]).toBeNull()
  })
})
