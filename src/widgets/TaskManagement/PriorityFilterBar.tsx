import { useTranslation } from 'react-i18next'

import type { ProjectWorkItem } from '@/entities/work-item'

import { PRIORITY_STYLE, type PriorityFilterSet } from './priorityStyles'

export type { PriorityFilterSet }

interface PriorityFilterBarProps {
  items: ProjectWorkItem[]
  activeFilters: PriorityFilterSet
  onFilterChange: (filters: PriorityFilterSet) => void
}

const PRIORITY_ORDER = ['VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW', 'none'] as const

/**
 * Multi-select priority badge filters. Only priorities with at least one item are shown.
 * Clicking a badge toggles it; multiple can be active simultaneously.
 * @param root0 - Component props.
 * @param root0.items - The work items whose priorities determine which badges are shown.
 * @param root0.activeFilters - The currently active priority filter set.
 * @param root0.onFilterChange - Called with the updated filter set when a badge is toggled.
 * @returns A row of priority filter badge buttons, or null when no priorities are present.
 */
export function PriorityFilterBar({
  items,
  activeFilters,
  onFilterChange,
}: PriorityFilterBarProps) {
  const { t } = useTranslation()

  const counts = PRIORITY_ORDER.reduce<Record<string, number>>((acc, p) => {
    const n =
      p === 'none'
        ? items.filter((wi) => wi.priority == null).length
        : items.filter((wi) => wi.priority === p).length
    if (n > 0) acc[p] = n
    return acc
  }, {})

  if (Object.keys(counts).length === 0) return null

  function toggle(p: string) {
    const next = new Set(activeFilters)
    if (next.has(p)) {
      next.delete(p)
    } else {
      next.add(p)
    }
    onFilterChange(next)
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-1.5">
      {PRIORITY_ORDER.filter((p) => counts[p] !== undefined).map((p) => {
        const style = PRIORITY_STYLE[p]
        const Icon = style.icon
        const isActive = activeFilters.has(p)
        const countLabel = `(${String(counts[p])})`
        return (
          <button
            key={p}
            type="button"
            onClick={() => toggle(p)}
            aria-pressed={isActive}
            className={[
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
              isActive ? style.activeBadge : style.badge,
            ].join(' ')}
          >
            <Icon
              className={`h-3 w-3 ${style.className}`}
              aria-hidden="true"
            />
            {p === 'none'
              ? t('entities.workItem.priority.none', 'No Priority')
              : t(`entities.workItem.priority.${p}`, p)}
            <span className="ml-0.5 font-semibold">{countLabel}</span>
          </button>
        )
      })}
    </div>
  )
}
