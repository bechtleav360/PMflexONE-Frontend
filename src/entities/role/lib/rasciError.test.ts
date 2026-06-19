import { describe, expect, it } from 'vitest'

import type { RasciErrorCode } from '../model/role.types'
import { getRasciErrorKey } from './rasciError'

const allCodes: RasciErrorCode[] = [
  'ROLE_HAS_ASSIGNED_USERS',
  'FIXED_ROLE_CANNOT_BE_DELETED',
  'DEFAULT_ROLE_CANNOT_BE_DELETED',
  'DIRECT_ASSIGNMENT_NOT_ALLOWED',
  'ROLE_NOT_MATERIALIZED',
  'ORIGIN_ROLE_STILL_EXISTS',
  'NO_TEMPLATE_ROLE',
  'TASK_NOT_IN_TEMPLATE',
  'FIXED_TASK_CANNOT_BE_MODIFIED',
  'TASK_MUTATION_NOT_ALLOWED_ON_TEMPLATE',
  'DEFAULT_ROLE_MUST_HAVE_AT_LEAST_ONE_USER',
  'SCOPE_PROPAGATION_CONFIG_NOT_FOUND',
]

describe('getRasciErrorKey', () => {
  it('maps all 12 RasciErrorCode values to distinct i18n keys', () => {
    const keys = allCodes.map(getRasciErrorKey)
    const uniqueKeys = new Set(keys)

    expect(uniqueKeys.size).toBe(allCodes.length)
  })

  it.each(allCodes)('%s maps to a pages.roleManagement.errors.* key', (code) => {
    const key = getRasciErrorKey(code)
    expect(key).toMatch(/^pages\.roleManagement\.errors\./)
  })

  it('returns the generic fallback for an unmapped code', () => {
    expect(getRasciErrorKey('UNKNOWN_CODE')).toBe('pages.roleManagement.errors.unknown')
  })
})
