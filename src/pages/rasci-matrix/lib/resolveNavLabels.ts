import type { DomainType } from '@/entities/role'

/** Maps URL objectType segments to their GraphQL DomainType values. */
export const DOMAIN_TYPE_MAP: Record<string, DomainType> = {
  projects: 'PROJECT',
  programs: 'PROGRAM',
  portfolios: 'PORTFOLIO',
}

/**
 * Returns true when any of the given pending flags is true.
 *
 * @param flags - Array of isPending booleans from TanStack Query hooks.
 * @returns True if at least one request is still in flight.
 */
export function anyPending(...flags: boolean[]): boolean {
  return flags.some(Boolean)
}

/**
 * Returns the DomainType for the given objectType URL segment, defaulting to `'PROJECT'`.
 *
 * @param objectType - URL segment identifying the object type.
 * @returns The corresponding DomainType.
 */
export function resolveDomainType(objectType: string): DomainType {
  return DOMAIN_TYPE_MAP[objectType] ?? 'PROJECT'
}

interface NavLabels {
  navLabel: string
  listPath: string
  detailPath: string
}

/**
 * Derives navigation breadcrumb paths and label for the RASCI matrix page.
 *
 * @param objectType - URL segment identifying the object type (`"projects"`, `"programs"`, `"portfolios"`).
 * @param objectId - The object's unique identifier.
 * @param navKeyMap - Pre-translated label map keyed by objectType.
 * @returns Navigation label and breadcrumb paths.
 */
export function resolveNavLabels(
  objectType: string,
  objectId: string,
  navKeyMap: Record<string, string>,
): NavLabels {
  return {
    navLabel: navKeyMap[objectType] ?? objectType,
    listPath: `/${objectType}`,
    detailPath: `/${objectType}/${objectId}`,
  }
}
