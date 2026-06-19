// ─── Types ────────────────────────────────────────────────────────────────────
export type { ScopeType } from '@/shared/types/scopeType'
export { SCOPE_TYPES } from '@/shared/types/scopeType'

export type {
  WorkItem,
  ProjectWorkItem,
  Board,
  BoardColumn,
  Label,
  Comment,
  Attachment,
  WorkItemLinkNode,
  ChangeHistoryEntry,
  Person,
  Scope,
  StatusLookup,
  WorkItemBaseStatus,
  ProjectWorkItemStatus,
  WorkItemPriority,
  CreateProjectWorkItemInput,
  UpdateProjectWorkItemInput,
  CreateBoardInput,
  UpdateBoardInput,
  CreateBoardColumnInput,
  UpdateBoardColumnInput,
  CreateLabelInput,
  UpdateLabelInput,
  CreateCommentInput,
  UpdateCommentInput,
  CreateWorkItemLinkInput,
  UICreateWorkItemLinkInput,
  UILinkType,
  CanonicalLinkType,
  CreateAttachmentInput,
} from './types/workItem.types'

// ─── Query key constants ──────────────────────────────────────────────────────
export {
  WORK_ITEMS_QUERY_KEY,
  WORK_ITEM_QUERY_KEY,
  WORK_ITEM_ATTACHMENTS_QUERY_KEY,
  BOARDS_QUERY_KEY,
  BOARD_CACHE_PREFIX,
  BOARD_QUERY_KEY,
  LABELS_QUERY_KEY,
  COMMENTS_QUERY_KEY,
  CHANGE_HISTORY_QUERY_KEY,
  LOOKUPS_QUERY_KEY,
} from './api/queryKeys'

// ─── GQL documents (for mutation hooks in feature slices) ─────────────────────
export {
  GET_WORK_ITEMS,
  GET_WORK_ITEM,
  GET_WORK_ITEM_ATTACHMENTS,
  UPDATE_PROJECT_WORK_ITEM,
} from './api/workItemApi'
export { GET_BOARDS, GET_BOARD } from './api/boardApi'
export { GET_LABELS } from './api/labelApi'
export { GET_COMMENTS } from './api/commentApi'
export {
  WORK_ITEM_CHANGE_HISTORY,
  BOARD_CHANGE_HISTORY,
  BOARD_COLUMN_CHANGE_HISTORY,
  COMMENT_CHANGE_HISTORY,
  LABEL_CHANGE_HISTORY,
} from './api/changeHistoryApi'
export {
  GET_LOOKUP_WORK_ITEM_BASE_STATUS,
  GET_LOOKUP_PROJECT_WORK_ITEM_STATUS,
  GET_LOOKUP_WORK_ITEM_PRIORITY,
} from './api/lookupsApi'
export { GET_PERSONS } from './api/personApi'

// ─── Zod schemas (for use in feature mutation validators) ─────────────────────
export {
  personSchema,
  workItemBaseSchema,
  projectWorkItemSchema,
  updateProjectWorkItem,
} from './api/workItemApi'
export { boardSchema } from './api/boardApi'
export { labelSchema } from './api/labelApi'
export { commentSchema, attachmentSchema } from './api/commentApi'
export { changeHistoryEntrySchema } from './api/changeHistoryApi'
export { statusLookupSchema } from './api/lookupsApi'

// ─── Read hooks ───────────────────────────────────────────────────────────────
export { useWorkItems } from './hooks/useWorkItems'
export { useWorkItem } from './hooks/useWorkItem'
export { useWorkItemAttachments } from './hooks/useWorkItemAttachments'
export { useBoards } from './hooks/useBoards'
export { useBoard } from './hooks/useBoard'
export { useLabels } from './hooks/useLabels'
export { useComments } from './hooks/useComments'
export {
  useWorkItemBaseStatusLookup,
  useProjectWorkItemStatusLookup,
  useWorkItemPriorityLookup,
} from './hooks/useLookups'
export { usePersons, PERSONS_QUERY_KEY } from './hooks/usePersons'
export {
  useWorkItemChangeHistory,
  useBoardChangeHistory,
  useBoardColumnChangeHistory,
  useCommentChangeHistory,
  useLabelChangeHistory,
} from './hooks/useChangeHistory'
export { WorkItemStatusBadge } from './components/WorkItemStatusBadge'
export { ChangeHistoryPanel } from './components/ChangeHistoryPanel'

// ─── Utils ────────────────────────────────────────────────────────────────────
export { invalidateWorkItemDependents } from './utils/queryInvalidation'
