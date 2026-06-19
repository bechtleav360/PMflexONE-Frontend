import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { useWorkItems, WorkItemStatusBadge } from '@/entities/work-item'
import type { ProjectWorkItem } from '@/entities/work-item'
import { useUnarchiveWorkItem } from '@/features/work-item-crud'
import { Button } from '@/shared/components'
import type { ScopeType } from '@/shared/types/scopeType'

import { PriorityFilterBar, type PriorityFilterSet } from './PriorityFilterBar'

interface ArchivePoolProps {
  scopeType: ScopeType
  scopeId: string
  onSelect?: (workItemId: string) => void
}

/**
 * Lists archived work items for the given scope with priority filtering and a restore action.
 * @param root0 - Component props.
 * @param root0.scopeType - The scope entity type.
 * @param root0.scopeId - The ID of the scope entity.
 * @param root0.onSelect - Called when the user clicks a task row to open the detail panel.
 * @returns The archived tasks pool section element.
 */
export function ArchivePool({ scopeType, scopeId, onSelect }: ArchivePoolProps) {
  const { t } = useTranslation()
  const [priorityFilters, setPriorityFilters] = useState<PriorityFilterSet>(new Set())
  const { data: items = [], isLoading } = useWorkItems(scopeType, scopeId, { archived: true })
  const { mutateAsync: unarchive } = useUnarchiveWorkItem()

  const archivedItems = items.filter((wi) => wi.archived)

  const visibleItems =
    priorityFilters.size > 0
      ? archivedItems.filter(
          (wi) =>
            (wi.priority != null && priorityFilters.has(wi.priority)) ||
            (wi.priority == null && priorityFilters.has('none')),
        )
      : archivedItems

  async function handleUnarchive(wi: ProjectWorkItem) {
    try {
      await unarchive({ id: wi.id, version: wi.version })
    } catch {
      // toast handled in hook
    }
  }

  return (
    <section
      aria-label={t('pages.taskManagement.archive', 'Archived Tasks')}
      className="opacity-80"
    >
      <h2 className="text-muted-foreground mb-3 text-lg font-semibold">
        {t('pages.taskManagement.archive', 'Archived Tasks')}
        {!isLoading && (
          <span className="bg-muted ml-2 rounded-full px-2 py-0.5 text-sm font-normal">
            {priorityFilters.size > 0
              ? `${visibleItems.length} / ${archivedItems.length}`
              : archivedItems.length}
          </span>
        )}
      </h2>

      {!isLoading && (
        <PriorityFilterBar
          items={archivedItems}
          activeFilters={priorityFilters}
          onFilterChange={setPriorityFilters}
        />
      )}

      {isLoading && (
        <p className="text-muted-foreground text-sm">{t('common.loading', 'Loading…')}</p>
      )}

      {!isLoading && visibleItems.length === 0 && (
        <p className="text-foreground text-sm">
          {priorityFilters.size > 0
            ? t('pages.taskManagement.noTasksForFilter', 'No tasks match the selected filter.')
            : t('pages.taskManagement.noArchivedTasks', 'No archived tasks.')}
        </p>
      )}

      <ul className="space-y-2">
        {visibleItems.map((wi) => (
          <li
            key={wi.id}
            className="bg-muted/40 flex items-center justify-between rounded-md border border-dashed px-4 py-2"
          >
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
              onClick={() => onSelect?.(wi.id)}
            >
              <span className="text-muted-foreground truncate text-sm font-medium line-through">
                {wi.name}
              </span>
              <WorkItemStatusBadge status={wi.status} />
            </button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUnarchive(wi)}
              aria-label={t('pages.taskManagement.unarchiveTask', { name: wi.name })}
            >
              {t('pages.taskManagement.unarchive', 'Restore')}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
