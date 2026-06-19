/**
 * Triggers the create-child flow: shows first-child warning if applicable, otherwise opens the form.
 *
 * @param nodeId - ID of the parent node.
 * @param nodeName - Name of the parent node, shown in the first-child warning dialog.
 * @param estimatedEffort - Effort of the parent node; triggers the warning when > 0.
 * @param hasChildren - Whether the parent already has children.
 * @param openFirstChildWarning - Store action to open the first-child warning dialog.
 * @param openFormDialog - Store action to open the create/edit form dialog.
 */
export function triggerCreateChild(
  nodeId: string,
  nodeName: string,
  estimatedEffort: number | null,
  hasChildren: boolean,
  openFirstChildWarning: (nodeId: string, nodeName: string, effort: number) => void,
  openFormDialog: (supportServiceId?: string | null, defaultParentId?: string | null) => void,
) {
  if (!hasChildren && estimatedEffort !== null && estimatedEffort > 0) {
    openFirstChildWarning(nodeId, nodeName, estimatedEffort)
  } else {
    openFormDialog(undefined, nodeId)
  }
}
