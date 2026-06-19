import { useTranslation } from 'react-i18next'

import { Checkbox, Combobox, Label } from '@/shared/components'

import type { ProblemManagementFilterState } from '../../types/registerRow.types'
import { PESTEL_OPTIONS, translateOptions } from '../../utils/pestelOptions'

/** Status option with value/label for the status combobox. */
interface StatusOption {
  value: string
  label: string
}

/**
 * Filter bar for the Problem Management table.
 *
 * Renders status (ITIL values), PESTEL, and "Show resolved / closed" controls.
 * No type filter — Problem Management shows only problem entries. All filter changes
 * are emitted via `onFilterChange` — no business logic is applied here.
 *
 * @param props - Component props.
 * @param props.filter - The current active filter state.
 * @param props.onFilterChange - Callback invoked with the updated filter whenever the user changes a control.
 * @param props.problemStatuses - Status options for problem entries (ITIL values from backend).
 * @returns The rendered filter bar.
 */
export function ProblemManagementFilters({
  filter,
  onFilterChange,
  problemStatuses = [],
}: {
  filter: ProblemManagementFilterState
  onFilterChange: (f: ProblemManagementFilterState) => void
  problemStatuses?: StatusOption[]
}) {
  const { t } = useTranslation()

  const pestelOptions = translateOptions(PESTEL_OPTIONS, t)

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Status filter */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="pm-filter-status">{t('pages.problemManagement.filters.status')}</Label>
        <Combobox
          id="pm-filter-status"
          value={filter.status ?? ''}
          onChange={(v) => onFilterChange({ ...filter, status: v ?? null })}
          options={problemStatuses}
          placeholder={t('pages.problemManagement.filters.statusAll')}
          className="w-44"
        />
      </div>

      {/* PESTEL filter */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="pm-filter-pestel">
          {t('pages.problemManagement.filters.pestelCategory')}
        </Label>
        <Combobox
          id="pm-filter-pestel"
          value={filter.pestelCategory ?? ''}
          onChange={(v) => onFilterChange({ ...filter, pestelCategory: v ?? null })}
          options={pestelOptions}
          placeholder={t('pages.problemManagement.filters.pestelAll')}
          className="w-44"
        />
      </div>

      {/* Show terminal statuses toggle */}
      <div className="flex items-center gap-1.5 pb-1">
        <Checkbox
          id="pm-filter-terminal"
          checked={filter.includeTerminalStatuses}
          onCheckedChange={(checked) =>
            onFilterChange({ ...filter, includeTerminalStatuses: checked === true })
          }
        />
        <Label
          htmlFor="pm-filter-terminal"
          className="cursor-pointer text-sm"
        >
          {t('pages.problemManagement.filters.showTerminal')}
        </Label>
      </div>
    </div>
  )
}
