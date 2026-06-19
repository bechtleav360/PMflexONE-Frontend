/**
 * A tree node that merges the domain item with the `TreeNodeBase` interface
 * required by `TreeView`. Item fields are spread directly — no `data` wrapper.
 */
export type TreeItem<T extends { id: string }> = T & { childNodes: TreeItem<T>[] }

/**
 * Assembles a flat list of items with `id` and optional `parent.id`
 * into a recursive tree structure in O(n) time.
 * Items whose `parent.id` references a non-existent node are treated as roots.
 * @param items - Flat array of items with optional parent references.
 * @returns Root nodes of the assembled tree.
 */
export function buildTree<T extends { id: string; parent?: { id: string } | null }>(
  items: T[],
): TreeItem<T>[] {
  const nodeMap = new Map<string, TreeItem<T>>()
  const roots: TreeItem<T>[] = []

  for (const item of items) {
    nodeMap.set(item.id, { ...item, childNodes: [] })
  }

  for (const item of items) {
    const node = nodeMap.get(item.id)!
    if (item.parent?.id) {
      const parent = nodeMap.get(item.parent.id)
      if (parent) parent.childNodes.push(node)
      else roots.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
