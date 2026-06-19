import type { WorkItemPriority } from './workItem.types'

// ─── Mutation input types ─────────────────────────────────────────────────────

/** Input for creating a new project work item. */
export interface CreateProjectWorkItemInput {
  scopeId: string
  scopeType: string
  name: string
  description?: string
  dueDate?: string
  priority?: WorkItemPriority
  assigneeId?: string | null
  labelIds?: string[]
  boardColumnId?: string | null
}

/** Input for updating an existing project work item; all fields except `version` are optional. */
export interface UpdateProjectWorkItemInput {
  version: number
  name?: string | null
  description?: string | null
  /** WorkItemBaseStatus only — `rejected` cannot be set via this mutation. */
  status?: 'open' | 'in_progress' | 'done' | null
  dueDate?: string | null
  priority?: WorkItemPriority | null
  assigneeId?: string | null
}

/** Input for creating a new board with an initial set of columns. */
export interface CreateBoardInput {
  scopeId: string
  scopeType: string
  name: string
  columns: CreateBoardColumnInput[]
}

/** Input for updating board metadata; all fields except `version` are optional. */
export interface UpdateBoardInput {
  version: number
  name?: string
}

/** Input for a single column when creating a board. */
export interface CreateBoardColumnInput {
  name: string
  workItemStatus: string
  position: number
}

/** Input for updating a board column; all fields except `version` are optional. */
export interface UpdateBoardColumnInput {
  version: number
  name?: string
  workItemStatus?: string
  position?: number
}

/** Input for creating a new label within a scope. */
export interface CreateLabelInput {
  scopeId: string
  scopeType: string
  name: string
  color?: string
}

/** Input for updating a label; all fields except `version` are optional. */
export interface UpdateLabelInput {
  version: number
  name?: string
  color?: string
}

/** Input for creating a comment on a work item. */
export interface CreateCommentInput {
  text: string
}

/** Input for updating the text of an existing comment. */
export interface UpdateCommentInput {
  version: number
  text: string
}

/** All link types visible in the UI — includes aliases `parent` and `previous`. */
export type UILinkType = 'parent' | 'child' | 'next' | 'previous' | 'related'

/** Canonical link types stored by the backend — `parent`/`previous` are never sent. */
export type CanonicalLinkType = 'child' | 'next' | 'related'

/** Input for creating a directed link between two work items (canonical, ready for GraphQL). */
export interface CreateWorkItemLinkInput {
  fromWorkItemId: string
  toWorkItemId: string
  linkType: CanonicalLinkType
}

/** Input as the user expressed it — may contain `parent`/`previous` before normalization. */
export interface UICreateWorkItemLinkInput {
  fromWorkItemId: string
  toWorkItemId: string
  linkType: UILinkType
}

/** Input for creating an attachment record after the asset has been uploaded. */
export interface CreateAttachmentInput {
  metadata?: string
}
