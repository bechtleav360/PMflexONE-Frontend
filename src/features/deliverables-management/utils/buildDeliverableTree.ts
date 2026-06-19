import type { Deliverable, DeliverableTreeNode } from '../types/deliverable.types'

/**
 * Converts a flat array of deliverables from the GraphQL response into a
 * nested tree structure sorted by `position` at each level.
 *
 * Orphan nodes (whose `parentId` is not found in the array) are treated as
 * root nodes so the tree always renders all deliverables.
 *
 * @param deliverables - Flat list of deliverables as returned by `GetDeliverableTree`.
 * @returns Array of root-level tree nodes, each with a `childNodes` array.
 */
export function buildDeliverableTree(deliverables: Deliverable[]): DeliverableTreeNode[] {
  if (deliverables.length === 0) return []

  // Build a lookup map: id → mutable tree node
  const nodeMap = new Map<string, DeliverableTreeNode>()
  for (const d of deliverables) {
    nodeMap.set(d.id, { ...d, childNodes: [] })
  }

  const roots: DeliverableTreeNode[] = []

  for (const d of deliverables) {
    const node = nodeMap.get(d.id)
    if (!node) continue

    const parentId = d.parent?.node.id ?? null

    if (parentId !== null) {
      const parentNode = nodeMap.get(parentId)
      if (parentNode) {
        parentNode.childNodes.push(node)
      } else {
        // Parent not found — treat as root (orphan)
        roots.push(node)
      }
    } else {
      roots.push(node)
    }
  }

  // Sort each level by position ascending
  sortNodes(roots)

  return roots
}

/**
 * Recursively sorts a node array and all descendant arrays by `position` ascending.
 *
 * @param nodes - Array of tree nodes to sort in place.
 */
function sortNodes(nodes: DeliverableTreeNode[]): void {
  nodes.sort((a, b) => a.position - b.position)
  for (const node of nodes) {
    if (node.childNodes.length > 0) {
      sortNodes(node.childNodes)
    }
  }
}
