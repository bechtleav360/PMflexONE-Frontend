import type { DeliverableTreeNode } from '../types/deliverable.types'

/**
 * Collects the IDs of all descendants of the given node within the tree.
 *
 * Used for two purposes:
 * 1. **Dropdown exclusion** — prevent selecting a descendant (or self) as parent.
 * 2. **Delete count** — count descendants before showing the cascade dialog.
 *
 * @param nodeId - The ID of the node whose descendants to collect.
 * @param tree - The full flat-or-nested tree. Can be a flat list of root nodes.
 * @returns A `Set<string>` of descendant IDs (does NOT include `nodeId` itself).
 */
export function getDeliverableDescendants(
  nodeId: string,
  tree: DeliverableTreeNode[],
): Set<string> {
  const result = new Set<string>()

  // Find the target node anywhere in the tree
  const target = findNode(nodeId, tree)
  if (!target) return result

  // Collect all descendant IDs recursively
  collectDescendantIds(target, result)

  return result
}

/**
 * Finds a node by ID anywhere in a tree (depth-first).
 *
 * @param id - Target node ID.
 * @param nodes - Current level of nodes to search.
 * @returns The matching node or `null` if not found.
 */
function findNode(id: string, nodes: DeliverableTreeNode[]): DeliverableTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findNode(id, node.childNodes)
    if (found) return found
  }
  return null
}

/**
 * Recursively collects the IDs of all children (and their children) into `acc`.
 *
 * @param node - The node whose subtree to collect.
 * @param acc - Accumulator set of IDs.
 */
function collectDescendantIds(node: DeliverableTreeNode, acc: Set<string>): void {
  for (const child of node.childNodes) {
    acc.add(child.id)
    collectDescendantIds(child, acc)
  }
}

/**
 * Returns all IDs that must be excluded from the parent dropdown for a given node.
 * This includes the node itself and all its descendants.
 *
 * @param nodeId - The node being edited.
 * @param tree - Full deliverable tree.
 * @returns A `Set<string>` of IDs to exclude from the dropdown.
 */
export function getExcludedParentIds(nodeId: string, tree: DeliverableTreeNode[]): Set<string> {
  const descendants = getDeliverableDescendants(nodeId, tree)
  descendants.add(nodeId)
  return descendants
}
