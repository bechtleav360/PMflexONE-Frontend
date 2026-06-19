// ─── Components ───────────────────────────────────────────────────────────────
export { CreateWorkItemDialog } from './components/CreateWorkItemDialog'
export { EditWorkItemDialog } from './components/EditWorkItemDialog'
export { WorkItemForm } from './components/WorkItemForm'
export type { WorkItemFormHandle } from './components/WorkItemForm'
// ─── Hooks ────────────────────────────────────────────────────────────────────
export { useCreateProjectWorkItem } from './hooks/useCreateProjectWorkItem'
export { useUpdateProjectWorkItem } from './hooks/useUpdateProjectWorkItem'
export { useDeleteProjectWorkItem } from './hooks/useDeleteProjectWorkItem'
export { useArchiveWorkItem, useUnarchiveWorkItem } from './hooks/useArchiveWorkItem'

// ─── Stores ───────────────────────────────────────────────────────────────────
export {
  useCreateWorkItemDialogStore,
  useEditWorkItemDialogStore,
  useDeleteWorkItemDialogStore,
} from './store/workItemDialogStores'

// ─── Utils ────────────────────────────────────────────────────────────────────
export { workItemFormSchema } from './utils/workItemFormSchema'
export type { WorkItemFormValues } from './utils/workItemFormSchema'

// ─── API (for re-use in feature slices) ───────────────────────────────────────
export {
  CREATE_PROJECT_WORK_ITEM,
  DELETE_PROJECT_WORK_ITEM,
  ARCHIVE_WORK_ITEM,
  UNARCHIVE_WORK_ITEM,
  toCreateInput,
  toUpdateInput,
} from './api/workItemMutationApi'
export { UPDATE_PROJECT_WORK_ITEM, updateProjectWorkItem } from '@/entities/work-item'
