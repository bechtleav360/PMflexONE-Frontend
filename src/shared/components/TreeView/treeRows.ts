/** Minimal interface every tree node must satisfy for `TreeView` to work. */
export interface TreeNodeBase {
  id: string
  childNodes: TreeNodeBase[]
}

/** A single row in the flattened visible tree, produced by {@link getFlatVisibleRows}. */
export interface FlatRow {
  id: string
  node: TreeNodeBase
  level: number
  posInSet: number
  setSize: number
}

/**
 * Flattens the visible portion of a tree into an ordered list of rows.
 *
 * Performs a depth-first walk and skips collapsed subtrees. The result
 * drives both `SortableContext` (all visible IDs) and the virtualizer
 * (index → row mapping).
 *
 * @param nodes - Nodes to traverse at the current level.
 * @param expandedIds - Set of node IDs whose children should be included.
 * @param level - 1-based nesting depth of the current level.
 * @returns Ordered flat list of visible rows with positional metadata.
 */
export function getFlatVisibleRows(
  nodes: TreeNodeBase[],
  expandedIds: Set<string>,
  level = 1,
): FlatRow[] {
  const rows: FlatRow[] = []
  const setSize = nodes.length
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    rows.push({ id: node.id, node, level, posInSet: i + 1, setSize })
    if (expandedIds.has(node.id) && node.childNodes.length > 0) {
      rows.push(...getFlatVisibleRows(node.childNodes, expandedIds, level + 1))
    }
  }
  return rows
}
