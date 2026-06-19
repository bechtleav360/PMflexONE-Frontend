import type { SupportService, SupportServiceTreeNode } from '../types/supportService.types'

/**
 * Converts a flat array of support services from the GraphQL response into a
 * nested tree structure sorted by `position` at each level.
 *
 * Orphan nodes (whose `parentId` is not found in the array) are treated as
 * root nodes so the tree always renders all support services.
 *
 * @param supportServices - Flat list of support services as returned by `GetSupportServices`.
 * @returns Array of root-level tree nodes, each with a `childNodes` array.
 */
export function buildSupportServiceTree(
  supportServices: SupportService[],
): SupportServiceTreeNode[] {
  if (supportServices.length === 0) return []

  // Build a lookup map: id → mutable tree node
  const nodeMap = new Map<string, SupportServiceTreeNode>()
  for (const s of supportServices) {
    nodeMap.set(s.id, { ...s, childNodes: [] })
  }

  const roots: SupportServiceTreeNode[] = []

  for (const s of supportServices) {
    const node = nodeMap.get(s.id)
    if (!node) continue

    const parentId = s.parent?.node.id ?? null

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
function sortNodes(nodes: SupportServiceTreeNode[]): void {
  nodes.sort((a, b) => a.position - b.position)
  for (const node of nodes) {
    if (node.childNodes.length > 0) {
      sortNodes(node.childNodes)
    }
  }
}
