import type { DeliverableTreeNode } from '../types/deliverable.types'

/**
 * Computes the next outline-number business ID given a parent business ID and a
 * sibling count. Low-level helper — prefer `suggestBusinessId` when you have the
 * full tree available.
 *
 * @param parentBusinessId - Business ID of the parent node, or `null`/`undefined` for root nodes.
 * @param siblingCount - 0-based number of existing siblings before the new node.
 * @returns A string outline number like `"1"`, `"1.2"`, `"2.3.1"`.
 */
export function generateBusinessId(
  parentBusinessId: string | null | undefined,
  siblingCount: number,
): string {
  const nextIndex = siblingCount + 1
  if (!parentBusinessId) {
    return String(nextIndex)
  }
  return `${parentBusinessId}.${nextIndex}`
}

/**
 * Computes a suggested business ID for a new deliverable being added to the tree.
 *
 * Uses the **maximum numeric suffix** among existing siblings rather than sibling
 * count, so deletions never produce duplicate suggestions.
 *
 * Examples:
 * - Root siblings with businessIds `["2","3","4","5","6"]` (item "1" was deleted)
 *   → `"7"` (max=6, next=7). A count-based approach would wrongly return `"6"`.
 * - Parent `"1"` has children `["1.1","1.3"]` (child `"1.2"` was deleted)
 *   → `"1.4"` (max suffix=3, next=4). Count-based would wrongly return `"1.3"`.
 * - No numeric siblings → starts from `"1"` / `"X.1"`.
 *
 * @param tree - Current full deliverable tree.
 * @param parentId - The ID of the parent node, or `null`/`undefined` for a root deliverable.
 * @returns A suggested outline-number business ID string.
 */
export function suggestBusinessId(
  tree: DeliverableTreeNode[],
  parentId: string | null | undefined,
): string {
  if (!parentId) {
    return suggestNextId(tree, null)
  }

  const parentNode = findNodeById(parentId, tree)
  if (!parentNode) {
    // Parent not found — fall back to treating it as a root suggestion
    return suggestNextId(tree, null)
  }

  return suggestNextId(parentNode.childNodes, parentNode.businessId)
}

/**
 * Checks whether a given businessId is already used by any deliverable in the flat list,
 * optionally excluding one node (e.g. the node being edited).
 *
 * @param businessId - The ID to check.
 * @param flat - Full flat list of deliverables for the project.
 * @param excludeId - Node ID to skip (e.g. the deliverable being edited).
 * @returns `true` if the businessId is already in use by another node.
 */
export function isBusinessIdDuplicate(
  businessId: string,
  flat: { id: string; businessId: string | null }[],
  excludeId?: string | null,
): boolean {
  return flat.some((d) => d.businessId === businessId && d.id !== excludeId)
}

/**
 * Given a list of siblings and the parent's businessId, computes the next suggested
 * businessId by finding the highest numeric suffix among the siblings' existing IDs.
 *
 * Falls back to `1` if no siblings carry a numeric businessId.
 *
 * @param siblings - Sibling nodes at the target level.
 * @param parentBusinessId - Business ID of the parent, or `null`/`undefined` for root nodes.
 * @returns The next suggested outline-number string.
 */
function suggestNextId(
  siblings: DeliverableTreeNode[],
  parentBusinessId: string | null | undefined,
): string {
  const numericSuffixes = siblings
    .map((s) => {
      if (!s.businessId) return null
      // For root nodes: the entire businessId is the suffix (e.g. "3")
      // For child nodes: only the last segment after the final "." (e.g. "1.2.3" → "3")
      const segment = parentBusinessId ? s.businessId.split('.').at(-1) : s.businessId
      return segment && /^\d+$/.test(segment) ? parseInt(segment, 10) : null
    })
    .filter((n): n is number => n !== null)

  const nextIndex = numericSuffixes.length > 0 ? Math.max(...numericSuffixes) + 1 : 1
  return parentBusinessId ? `${parentBusinessId}.${nextIndex}` : String(nextIndex)
}

/**
 * Finds a tree node by ID using depth-first search.
 *
 * @param id - The node ID to find.
 * @param nodes - Tree nodes to search.
 * @returns The matching node, or `null` if not found.
 */
function findNodeById(id: string, nodes: DeliverableTreeNode[]): DeliverableTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findNodeById(id, node.childNodes)
    if (found) return found
  }
  return null
}
