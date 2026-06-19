import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'

import { formatPersonName } from '@/shared/lib/utils'

import {
  useBoardChangeHistory,
  useBoardColumnChangeHistory,
  useCommentChangeHistory,
  useLabelChangeHistory,
  useWorkItemChangeHistory,
} from '../../hooks/useChangeHistory'
import type { ChangeHistoryEntry } from '../../types/workItem.types'
import { HistoryStatus } from './HistoryStatus'
import { mergeAssigneeEntries } from './mergeAssigneeEntries'

type EntityType = 'workItem' | 'board' | 'boardColumn' | 'comment' | 'label'

interface ChangeHistoryPanelProps {
  entityType: EntityType
  entityId: string
  isOpen: boolean
  /** Optional map of id → name used to resolve label UUIDs in history entries. */
  labelMap?: Record<string, string>
  /** Optional map of id → name used to resolve assignee UUIDs in history entries. */
  assigneeMap?: Record<string, string>
  /** Optional map of column id → name used to resolve column UUIDs in history entries. */
  columnMap?: Record<string, string>
}

function resolveArgs(
  forType: EntityType,
  entityType: EntityType,
  entityId: string,
  isOpen: boolean,
): [string, boolean] {
  if (entityType === forType) return [entityId, isOpen]
  return ['', false]
}

/**
 * Fetches the relevant change history entries for the given entity type.
 *
 * All five query hooks are called unconditionally to comply with React's rules of hooks
 * (hooks must not be called conditionally). Queries for non-matching entity types receive an
 * empty string as their ID and `isOpen = false`, so they are disabled and produce no network
 * requests. The trade-off is five hook registrations per render instead of one; the runtime
 * cost is negligible because the disabled queries are no-ops in TanStack Query.
 * @param entityType - Which entity type to fetch history for.
 * @param entityId - The entity ID.
 * @param isOpen - Whether the panel is open (false disables all queries).
 * @returns The combined query result for the active entity type.
 */
function useHistory(entityType: EntityType, entityId: string, isOpen: boolean) {
  const wi = useWorkItemChangeHistory(...resolveArgs('workItem', entityType, entityId, isOpen))
  const board = useBoardChangeHistory(...resolveArgs('board', entityType, entityId, isOpen))
  const col = useBoardColumnChangeHistory(
    ...resolveArgs('boardColumn', entityType, entityId, isOpen),
  )
  const comment = useCommentChangeHistory(...resolveArgs('comment', entityType, entityId, isOpen))
  const label = useLabelChangeHistory(...resolveArgs('label', entityType, entityId, isOpen))

  // For work items, also fetch label link/unlink events stored in label_change_history_entries
  // with entity_id = workItemId (recorded by addLabelToWorkItem / removeLabelFromWorkItem)
  const wiLabels = useLabelChangeHistory(...resolveArgs('workItem', entityType, entityId, isOpen))

  const wiCombined = {
    ...wi,
    data: [...(wi.data ?? []), ...(wiLabels.data ?? [])],
    isLoading: wi.isLoading || wiLabels.isLoading,
    isError: wi.isError || wiLabels.isError,
  }

  const lookup = { workItem: wiCombined, board, boardColumn: col, comment, label }
  return lookup[entityType]
}

const FIELD_SEP = ': '
const VALUE_SEP = ' → '

type TFunction = ReturnType<typeof useTranslation>['t']

function renderLabelEntry(
  entry: ChangeHistoryEntry,
  labelMap: Record<string, string>,
  t: TFunction,
) {
  const labelId = entry.newValue ?? entry.oldValue ?? ''
  const labelName = (labelMap[labelId] ?? labelId) || '—'
  const action =
    entry.newValue != null
      ? t('entities.workItemHistory.labelLinked', 'Label added')
      : t('entities.workItemHistory.labelUnlinked', 'Label removed')
  return (
    <span>
      {action}
      {FIELD_SEP}
      <span className="font-medium">{labelName}</span>
    </span>
  )
}

function resolveValueMap(
  changedField: string | null,
  assigneeMap: Record<string, string>,
  columnMap: Record<string, string>,
): Record<string, string> {
  if (changedField === 'assignee') return assigneeMap
  if (changedField === 'column') return columnMap
  return {}
}

function renderEntryBody(
  entry: ChangeHistoryEntry,
  labelMap: Record<string, string>,
  t: TFunction,
  assigneeMap: Record<string, string>,
  columnMap: Record<string, string>,
) {
  if (entry.changedField == null) {
    return (
      <span className="text-muted-foreground italic">
        {t('entities.workItemHistory.created', 'Created')}
      </span>
    )
  }

  if (entry.changedField === 'label') return renderLabelEntry(entry, labelMap, t)

  if (entry.changedField === 'assignee' && entry.newValue === null) {
    return (
      <span>
        <span className="font-medium">
          {t('entities.workItemHistory.fields.assignee', 'Assignee')}
        </span>
        {FIELD_SEP}
        <span className="text-muted-foreground">
          {t('entities.workItemHistory.assigneeUnassigned', 'Unassigned')}
        </span>
      </span>
    )
  }

  const valueMap = resolveValueMap(entry.changedField, assigneeMap, columnMap)
  const oldDisplay = entry.oldValue ? (valueMap[entry.oldValue] ?? entry.oldValue) : '—'
  const newDisplay = entry.newValue ? (valueMap[entry.newValue] ?? entry.newValue) : '—'

  return (
    <>
      <span className="font-medium">
        {t(`entities.workItemHistory.fields.${entry.changedField}`, entry.changedField)}
      </span>
      {FIELD_SEP}
      <span className="text-muted-foreground line-through">{oldDisplay}</span>
      {VALUE_SEP}
      <span>{newDisplay}</span>
    </>
  )
}

/**
 * Lazily-loaded change history for a work-item-domain entity; only fetches when `isOpen` is true.
 * @param root0 - Component props.
 * @param root0.entityType - The type of entity to load history for (e.g. "workItem", "board").
 * @param root0.entityId - The ID of the entity.
 * @param root0.isOpen - When false the history query is skipped to avoid unnecessary requests.
 * @param root0.labelMap - Optional map of label id → name for resolving label UUIDs.
 * @param root0.assigneeMap - Optional map of assignee id → name for resolving assignee UUIDs.
 * @param root0.columnMap - Optional map of column id → name for resolving column UUIDs.
 * @returns A section with a time-sorted list of change events.
 */
export function ChangeHistoryPanel({
  entityType,
  entityId,
  isOpen,
  labelMap = {},
  assigneeMap = {},
  columnMap = {},
}: ChangeHistoryPanelProps) {
  const { t } = useTranslation()
  const { data: entries = [], isLoading, isError } = useHistory(entityType, entityId, isOpen)

  const sortedEntries = useMemo(
    () =>
      mergeAssigneeEntries(
        [...entries].sort(
          (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime(),
        ),
      ),
    [entries],
  )

  return (
    <section aria-label={t('entities.workItemHistory.panel', 'Change History')}>
      <h3 className="mb-3 text-sm font-semibold">
        {t('entities.workItemHistory.panel', 'Change History')}
      </h3>

      <HistoryStatus
        isOpen={isOpen}
        isLoading={isLoading}
        isError={isError}
        isEmpty={sortedEntries.length === 0}
      />

      <ul className="space-y-2">
        {sortedEntries.map((entry: ChangeHistoryEntry) => {
          const changedByName = formatPersonName(entry.changedBy, t('common.unknown', 'Unknown'))

          return (
            <li
              key={entry.id}
              className="bg-card rounded-md border px-3 py-2 text-sm"
            >
              <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
                <span>{changedByName}</span>
                <span>{new Date(entry.changedAt).toLocaleString()}</span>
              </div>
              <div className="mt-1">
                {renderEntryBody(entry, labelMap, t, assigneeMap, columnMap)}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
