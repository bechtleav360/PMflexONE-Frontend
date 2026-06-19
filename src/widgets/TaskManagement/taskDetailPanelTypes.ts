import { z } from 'zod'

import { workItemFormSchema } from '@/features/work-item-crud'

/** Extended work item form schema that also accepts an optional status field for in-panel editing. */
export const editFormSchema = workItemFormSchema.extend({
  status: z.string().nullable().optional(),
})
/** Inferred TypeScript type for the extended edit form schema. */
export type EditFormValues = z.infer<typeof editFormSchema>

/** Empty default values used when opening the panel in create mode. */
export const BLANK_FORM: EditFormValues = {
  name: '',
  description: null,
  dueDate: null,
  priority: null,
  assigneeId: null,
  status: null,
  labelIds: [] as string[],
}

/** Panel display mode: view details, edit in place, or create a new item. */
export type DetailPanelMode = 'view' | 'edit' | 'create'
