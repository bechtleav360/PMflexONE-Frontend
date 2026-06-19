import type {
  CanonicalLinkType,
  CreateWorkItemLinkInput,
  UICreateWorkItemLinkInput,
  UILinkType,
  WorkItemLinkNode,
} from '@/entities/work-item'

/**
 * Maps UI link types to their canonical backend equivalents.
 *
 * The backend stores only three canonical types: `child`, `next`, `related`.
 * `parent` and `previous` are UI aliases that require ID reversal before sending.
 *
 *   parent(A→B)   → child(B→A)
 *   previous(A→B) → next(B→A)
 *   child(A→B)    → child(A→B)
 *   next(A→B)     → next(A→B)
 *   related(A→B)  → related(A→B)
 * @param input - The UI-level link input to normalize before sending to the backend.
 * @returns A canonical `CreateWorkItemLinkInput` with IDs reversed where necessary.
 */
export function normalizeWorkItemLink(input: UICreateWorkItemLinkInput): CreateWorkItemLinkInput {
  switch (input.linkType) {
    case 'parent':
      return {
        fromWorkItemId: input.toWorkItemId,
        toWorkItemId: input.fromWorkItemId,
        linkType: 'child',
      }
    case 'previous':
      return {
        fromWorkItemId: input.toWorkItemId,
        toWorkItemId: input.fromWorkItemId,
        linkType: 'next',
      }
    default:
      return {
        fromWorkItemId: input.fromWorkItemId,
        toWorkItemId: input.toWorkItemId,
        linkType: input.linkType as CanonicalLinkType,
      }
  }
}

/**
 * Maps a canonical `edgeTypeName` returned by the backend back to a UI-facing label.
 * The backend returns edge names from the queried item's perspective, so this is a
 * direct pass-through with a safe fallback — no reversal needed here.
 * @param edgeTypeName - The edge type name from the backend response.
 * @returns The corresponding UI link type, or `'related'` as a safe fallback.
 */
export function denormalizeEdgeType(edgeTypeName: string | null): UILinkType {
  const known: UILinkType[] = ['parent', 'child', 'next', 'previous', 'related']
  return known.includes(edgeTypeName as UILinkType) ? (edgeTypeName as UILinkType) : 'related'
}

// ─── Client-side link validation ─────────────────────────────────────────────

/** Reasons why a proposed link is invalid. */
export type LinkValidationError =
  | 'SELF_LINK' // fromWorkItemId === toWorkItemId
  | 'DUPLICATE_LINK' // exact same (target, type) already exists
  | 'OPPOSITE_DIRECTION' // target already linked with the inverse directed type
  | 'ALREADY_LINKED' // target already linked with a different type

const OPPOSITE: Partial<Record<string, string>> = {
  parent: 'child',
  child: 'parent',
  next: 'previous',
  previous: 'next',
}

/**
 * Validates a proposed link against the source work item's existing links.
 * Run this BEFORE calling the mutation to give immediate, specific feedback.
 *
 * @param input - The UI-level link input (before normalization).
 * @param existingLinks - Links already on the source work item.
 * @returns A `LinkValidationError` key, or `null` when the link is valid.
 */
export function validateWorkItemLink(
  input: UICreateWorkItemLinkInput,
  existingLinks: WorkItemLinkNode[],
): LinkValidationError | null {
  if (input.fromWorkItemId === input.toWorkItemId) return 'SELF_LINK'

  const existing = existingLinks.find((l) => l.item?.id === input.toWorkItemId)
  if (!existing) return null

  const existingType = existing.edgeTypeName ?? ''

  if (existingType === input.linkType) return 'DUPLICATE_LINK'

  if (OPPOSITE[input.linkType] === existingType || OPPOSITE[existingType] === input.linkType) {
    return 'OPPOSITE_DIRECTION'
  }

  return 'ALREADY_LINKED'
}
