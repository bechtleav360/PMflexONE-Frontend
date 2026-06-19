import { describe, expect, it } from 'vitest'

import type { PermissionKey } from '../model/role.types'
import { getAccessLevel } from './accessLevel'

describe('getAccessLevel', () => {
  it.each<[PermissionKey, 'write']>([
    ['R', 'write'],
    ['A', 'write'],
    ['S', 'write'],
    ['C', 'write'],
  ])('%s → write', (key, expected) => {
    expect(getAccessLevel(key)).toBe(expected)
  })

  it("'I' maps to 'read'", () => {
    expect(getAccessLevel('I')).toBe('read')
  })

  it("'—' maps to 'none'", () => {
    expect(getAccessLevel('—')).toBe('none')
  })
})
