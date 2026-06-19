import type { TFunction } from 'i18next'

import type { AccessLevel } from '@/entities/role'
import { getAccessLevel } from '@/entities/role'

export { getAccessLevel }
export type { AccessLevel }

/**
 * Returns the i18n label for the given access level.
 *
 * @param level - The access level (write, read, or none).
 * @param t - The i18next translate function.
 * @returns The localised label string.
 */
export function getAccessLevelLabel(level: AccessLevel, t: TFunction): string {
  return t(`pages.rasciMatrix.accessLevel.${level}`)
}
