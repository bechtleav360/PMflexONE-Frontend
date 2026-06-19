import type { AccessLevel, PermissionKey } from '../model/role.types'

/**
 * Maps a RASCI PermissionKey to its access level. R/A/S/C → write; I → read; — → none.
 * @param key - The RASCI permission key to evaluate.
 * @returns The corresponding access level.
 */
export function getAccessLevel(key: PermissionKey): AccessLevel {
  if (key === 'I') return 'read'
  if (key === '—') return 'none'
  return 'write'
}
