import type { z } from 'zod'

import type {
  deliverableFormValuesSchema,
  deliverableSchema,
  deliverableTreeNodeSchema,
  personOptionSchema,
} from '../api/deliverablesApi'

/** A single deliverable as returned by the API. */
export type Deliverable = z.infer<typeof deliverableSchema>

/** A deliverable enriched with recursive children for client-side tree rendering. */
export type DeliverableTreeNode = z.infer<typeof deliverableTreeNodeSchema>

/** Form values for create / edit modal. */
export type DeliverableFormValues = z.infer<typeof deliverableFormValuesSchema>

/** A person option used in owner typeahead. */
export type PersonOption = z.infer<typeof personOptionSchema>

/** Modal open mode. */
export type DeliverableModalMode = 'create' | 'edit' | 'read'

/** Shape of the modal state held in the UI store. */
export interface DeliverableModalState {
  /** Whether the modal is currently visible. */
  open: boolean
  /** Interaction mode. */
  mode: DeliverableModalMode
  /** ID of the deliverable being viewed or edited, or `null` in create mode. */
  deliverableId: string | null
  /** Pre-fill for the parent field when creating a child deliverable. */
  initialParentId: string | null
}
