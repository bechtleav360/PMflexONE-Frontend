// ─── Enumerations ────────────────────────────────────────────────────────────

/** Union of status values shared by all work item types. */
export type WorkItemBaseStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE'

/** Extended status set available on project-scoped work items. */
export type ProjectWorkItemStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'REJECTED'

/** Relative importance level of a work item. */
export type WorkItemPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'

// ─── Shared sub-types ────────────────────────────────────────────────────────

/** Represents a user referenced on a work item (creator, assignee, etc.). */
export interface Person {
  id: string
  firstName: string
  lastName: string
  /** Null for service accounts and legacy records that pre-date the mail column. Undefined when the field is omitted by the API. */
  mail?: string | null
}

/** Polymorphic scope — Portfolio | Program | Project. */
export interface Scope {
  id: string
  name: string
}

/** Display pair used to render a status value in the UI. */
export interface StatusLookup {
  value: string
  label: string
}

// ─── Projection / partial types ──────────────────────────────────────────────

/**
 * Partial board-column shape embedded inside work-item responses.
 * Full column data (creator, updater, workItems, audit timestamps) is only
 * available when fetching a board directly via the board API.
 */
export interface BoardColumnRef {
  id: string
  version: number
  name: string
  workItemStatus: string
  position: number
  board?: { id: string; name: string }
}

/**
 * Partial label shape embedded inside work-item responses.
 * Full label data (audit timestamps, scope, creator, etc.) is only available
 * when fetching labels directly via the label API.
 */
export interface LabelRef {
  id: string
  version: number
  name: string
  color: string | null
}

// ─── Core entities ───────────────────────────────────────────────────────────

/** A colored tag that can be attached to work items within a scope. */
export interface Label {
  id: string
  version: number
  name: string
  /** ARGB hex string, e.g. "#FF3366CC" */
  color: string | null
  createdAt: string
  updatedAt: string
  metadata: string | null
  creator: Person | null
  updater: Person | null
  scope: Scope | null
}

/** A file attached to a work item or comment. */
export interface Attachment {
  id: string
  version: number
  /** Null while asset enrichment is in-flight immediately after upload. */
  fileName: string | null
  /** Null while asset enrichment is in-flight immediately after upload. */
  storageKey: string | null
  size: number | null
  createdAt: string
  updatedAt: string
  /** Opaque upload metadata; may be absent on enriched attachments. */
  metadata?: string | null
  creator: Person | null
}

/** A user comment on a work item, optionally with file attachments. */
export interface Comment {
  id: string
  version: number
  /** Markdown text. */
  text: string
  createdAt: string
  updatedAt: string
  metadata: string | null
  creator: Person
  attachments: Attachment[]
  /** Not included in list-comment queries; present only when fetched via work-item detail. */
  scope?: Scope | null
}

/**
 * A single column on a kanban board.
 * Fields marked optional are not returned by all board queries —
 * the list query omits creator, updater, workItems, and board back-reference.
 */
export interface BoardColumn {
  id: string
  version: number
  name: string
  workItemStatus: string
  position: number
  createdAt: string
  updatedAt: string
  metadata?: string | null
  creator?: Person | null
  updater?: Person | null
  /** Present only when fetched via board detail query. */
  workItems?: ProjectWorkItem[]
  /** Not returned when column is fetched as part of a board response. */
  board?: { id: string; name: string }
}

/** A kanban board scoped to a portfolio, program, or project. */
export interface Board {
  id: string
  version: number
  name: string
  createdAt: string
  updatedAt: string
  metadata: string | null
  creator: Person | null
  updater: Person | null
  columns: BoardColumn[]
  scope: Scope | null
}

/** An edge in the work-item link graph, carrying the linked item and relationship type. */
export interface WorkItemLinkNode {
  edgeTypeName: string | null
  metadata: string | null
  item: WorkItem | null
}

/**
 * Base work-item shape returned by list and board queries.
 * Fields marked optional are only populated by the detail query ({@link ProjectWorkItem}).
 */
export interface WorkItem {
  id: string
  /** Optimistic lock field — required on all mutations. */
  version: number
  name: string
  description: string | null
  status: WorkItemBaseStatus | string
  /** ISO date string YYYY-MM-DD */
  dueDate: string | null
  priority?: WorkItemPriority | null
  archived: boolean
  createdAt: string
  updatedAt: string
  /** Opaque backend field — do not parse on frontend. */
  metadata: string | null
  creator: Person | null
  updater: Person | null
  /** undefined = not fetched (board query omits this field). null = in active pool. */
  boardColumn?: BoardColumnRef | null
  /** Partial shape — full label data via label API. */
  labels?: LabelRef[]
  /** Only populated by the single-item detail query. */
  comments?: Comment[]
  /** Only populated by the single-item detail query. */
  attachments?: Attachment[]
  /** Only populated by the single-item detail query. */
  links?: WorkItemLinkNode[]
  scope: Scope | null
  assignee: Person | null
  /** Sort position within the board column or active pool; null until first positioned. */
  position?: number | null
}

/** Work item fetched via the detail query — includes comments, links, and a narrowed status. */
export interface ProjectWorkItem extends WorkItem {
  status: ProjectWorkItemStatus
  comments?: Comment[]
  links?: WorkItemLinkNode[]
}

/** A single audit entry recording a field change on any tracked entity. */
export interface ChangeHistoryEntry {
  id: string
  entityId: string
  changedField: string | null
  oldValue: string | null
  newValue: string | null
  changedAt: string
  changedBy: Person | null
}

export type {
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
  UILinkType,
  CanonicalLinkType,
  CreateWorkItemLinkInput,
  UICreateWorkItemLinkInput,
  CreateAttachmentInput,
} from './workItemMutation.types'
