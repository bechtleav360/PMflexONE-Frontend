import { useTranslation } from 'react-i18next'

import { Checkbox, Combobox, Label } from '@/shared/components'

import type { IssueManagementFilterState } from '../../types/registerRow.types'
import { PESTEL_OPTIONS, translateOptions } from '../../utils/pestelOptions'

/** Status option with value/label for the status combobox. */
interface StatusOption {
  value: string
  label: string
}

/**
 * Filter bar for the Issue Management table.
 *
 * Renders status, PESTEL, and "Show resolved / closed" controls. No type filter
 * since Issue Management shows only issue entries. All filter changes are emitted
 * via `onFilterChange` — no business logic is applied here.
 *
 * @param props - Component props.
 * @param props.filter - The current active filter state.
 * @param props.onFilterChange - Callback invoked with the updated filter whenever the user changes a control.
 * @param props.issueStatuses - Status options for issue entries.
 * @returns The rendered filter bar.
 */
export function IssueManagementFilters({
  filter,
  onFilterChange,
  issueStatuses = [],
}: {
  filter: IssueManagementFilterState
  onFilterChange: (f: IssueManagementFilterState) => void
  issueStatuses?: StatusOption[]
}) {
  const { t } = useTranslation()

  const pestelOptions = translateOptions(PESTEL_OPTIONS, t)

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Status filter */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="im-filter-status">{t('pages.issueManagement.filters.status')}</Label>
        <Combobox
          id="im-filter-status"
          value={filter.status ?? ''}
          onChange={(v) => onFilterChange({ ...filter, status: v ?? null })}
          options={issueStatuses}
          placeholder={t('pages.issueManagement.filters.statusAll')}
          className="w-44"
        />
      </div>

      {/* PESTEL filter */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="im-filter-pestel">
          {t('pages.issueManagement.filters.pestelCategory')}
        </Label>
        <Combobox
          id="im-filter-pestel"
          value={filter.pestelCategory ?? ''}
          onChange={(v) => onFilterChange({ ...filter, pestelCategory: v ?? null })}
          options={pestelOptions}
          placeholder={t('pages.issueManagement.filters.pestelAll')}
          className="w-44"
        />
      </div>

      {/* Show terminal statuses toggle */}
      <div className="flex items-center gap-1.5 pb-1">
        <Checkbox
          id="im-filter-terminal"
          checked={filter.includeTerminalStatuses}
          onCheckedChange={(checked) =>
            onFilterChange({ ...filter, includeTerminalStatuses: checked === true })
          }
        />
        <Label
          htmlFor="im-filter-terminal"
          className="cursor-pointer text-sm"
        >
          {t('pages.issueManagement.filters.showTerminal')}
        </Label>
      </div>
    </div>
  )
}
