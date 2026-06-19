// Public API for the deliverables-management feature.
// Pages import from here; internal components reference each other directly.

export { DeliverableFormModal } from './components/DeliverableFormModal'
export { DeleteDeliverableDialog } from './components/DeleteDeliverableDialog'
export { DeliverableListView } from './components/DeliverableListView'
export { DeliverableTreeView } from './components/DeliverableTreeView'
export { DeliverableViewToggle } from './components/DeliverableViewToggle'
export type { DeliverableViewTab } from './components/DeliverableViewToggle'

export { useDeliverable, useDeliverableTree } from './hooks/useDeliverables'
export { usePersons } from './hooks/usePersons'
export { useCreateDeliverable } from './hooks/useCreateDeliverable'
export { useUpdateDeliverable } from './hooks/useUpdateDeliverable'
export { useDeleteDeliverable } from './hooks/useDeleteDeliverable'
export { useMoveDeliverable } from './hooks/useMoveDeliverable'
export { useDeliverableReorder } from './hooks/useDeliverableReorder'

export { useDeliverablesUiStore } from './store/deliverablesUiStore'

export type {
  Deliverable,
  DeliverableFormValues,
  DeliverableModalMode,
  DeliverableModalState,
  DeliverableTreeNode,
  PersonOption,
} from './types/deliverable.types'
