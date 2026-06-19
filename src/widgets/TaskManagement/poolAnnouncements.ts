import type { useTranslation } from 'react-i18next'

import type { ProjectWorkItem } from '@/entities/work-item'

/**
 * Builds dnd-kit accessibility announcement callbacks for the active pool.
 * @param visibleItems - Currently visible pool items used to resolve names by id.
 * @param t - i18next translation function.
 * @returns Object with onDragStart, onDragOver, onDragEnd, onDragCancel handlers.
 */
export function buildPoolAnnouncements(
  visibleItems: ProjectWorkItem[],
  t: ReturnType<typeof useTranslation>['t'],
) {
  function nameOf(id: string | number) {
    return visibleItems.find((wi) => wi.id === id)?.name ?? String(id)
  }
  return {
    onDragStart: ({ active }: { active: { id: string | number } }) =>
      t('pages.taskManagement.poolDragStart', {
        name: nameOf(active.id),
        defaultValue: 'Picked up task {{name}}',
      }),
    onDragOver: ({
      active,
      over,
    }: {
      active: { id: string | number }
      over: { id: string | number } | null
    }) =>
      over
        ? t('pages.taskManagement.poolDragOver', {
            name: nameOf(active.id),
            target: nameOf(over.id),
            defaultValue: 'Task {{name}} is over {{target}}',
          })
        : t('pages.taskManagement.poolDragOverNothing', {
            name: nameOf(active.id),
            defaultValue: 'Task {{name}} is not over a drop target',
          }),
    onDragEnd: ({
      active,
      over,
    }: {
      active: { id: string | number }
      over: { id: string | number } | null
    }) =>
      over
        ? t('pages.taskManagement.poolDragEnd', {
            name: nameOf(active.id),
            target: nameOf(over.id),
            defaultValue: 'Task {{name}} moved before {{target}}',
          })
        : t('pages.taskManagement.poolDragCancelled', {
            name: nameOf(active.id),
            defaultValue: 'Dragging {{name}} was cancelled',
          }),
    onDragCancel: ({ active }: { active: { id: string | number } }) =>
      t('pages.taskManagement.poolDragCancelled', {
        name: nameOf(active.id),
        defaultValue: 'Dragging {{name}} was cancelled',
      }),
  }
}
