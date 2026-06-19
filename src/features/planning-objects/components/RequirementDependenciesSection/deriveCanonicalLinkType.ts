import type { RequirementDependencyEdgeType } from '../../types/requirement.types'

/**
 * Maps an inverse edge type to the canonical edge type for unlinking.
 *
 * The backend accepts only canonical (outgoing) edge types for unlinkRequirements.
 *
 * @param edgeType - The edge type as stored on the requirement.
 * @returns The canonical edge type to pass to the mutation.
 */
export function deriveCanonicalLinkType(
  edgeType: RequirementDependencyEdgeType,
): 'blocks' | 'duplicates' | 'relates_to' {
  switch (edgeType) {
    case 'blocks':
    case 'blocked_by':
      return 'blocks'
    case 'duplicates':
    case 'duplicated_by':
      return 'duplicates'
    default:
      return 'relates_to'
  }
}
