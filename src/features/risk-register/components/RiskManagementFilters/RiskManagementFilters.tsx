import { useTranslation } from 'react-i18next'

import { Checkbox, Combobox, Label } from '@/shared/components'

import type { RiskManagementFilterState } from '../../types/registerRow.types'
import { PESTEL_OPTIONS, translateOptions } from '../../utils/pestelOptions'
import { RISK_TYPE_OPTIONS } from '../../utils/riskTypeOptions'

/** Status option with value/label for the status combobox. */
interface StatusOption {
  value: string
  label: string
}

/**
 * Filter bar for the Risk Management table.
 *
 * Renders type (risk/opportunity only), status, PESTEL, and "Show closed / rejected"
 * controls. All filter changes are emitted via `onFilterChange` — no business logic
 * is applied here.
 *
 * @param props - Component props.
 * @param props.filter - The current active filter state.
 * @param props.onFilterChange - Callback invoked with the updated filter whenever the user changes a control.
 * @param props.riskStatuses - Status options for risk/opportunity entries.
 * @returns The rendered filter bar.
 */
export function RiskManagementFilters({
  filter,
  onFilterChange,
  riskStatuses = [],
}: {
  filter: RiskManagementFilterState
  onFilterChange: (f: RiskManagementFilterState) => void
  riskStatuses?: StatusOption[]
}) {
  const { t } = useTranslation()

  const typeOptions = translateOptions(RISK_TYPE_OPTIONS, t)
  const pestelOptions = translateOptions(PESTEL_OPTIONS, t)

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Type filter */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="rm-filter-type">{t('pages.riskManagement.filters.type')}</Label>
        <Combobox
          id="rm-filter-type"
          value={filter.type ?? ''}
          onChange={(v) =>
            onFilterChange({ ...filter, type: (v ?? null) as RiskManagementFilterState['type'] })
          }
          options={typeOptions}
          placeholder={t('pages.riskManagement.filters.typeAll')}
          className="w-44"
        />
      </div>

      {/* Status filter */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="rm-filter-status">{t('pages.riskManagement.filters.status')}</Label>
        <Combobox
          id="rm-filter-status"
          value={filter.status ?? ''}
          onChange={(v) => onFilterChange({ ...filter, status: v ?? null })}
          options={riskStatuses}
          placeholder={t('pages.riskManagement.filters.statusAll')}
          className="w-44"
        />
      </div>

      {/* PESTEL filter */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="rm-filter-pestel">{t('pages.riskManagement.filters.pestelCategory')}</Label>
        <Combobox
          id="rm-filter-pestel"
          value={filter.pestelCategory ?? ''}
          onChange={(v) => onFilterChange({ ...filter, pestelCategory: v ?? null })}
          options={pestelOptions}
          placeholder={t('pages.riskManagement.filters.pestelAll')}
          className="w-44"
        />
      </div>

      {/* Show terminal statuses toggle */}
      <div className="flex items-center gap-1.5 pb-1">
        <Checkbox
          id="rm-filter-terminal"
          checked={filter.includeTerminalStatuses}
          onCheckedChange={(checked) =>
            onFilterChange({ ...filter, includeTerminalStatuses: checked === true })
          }
        />
        <Label
          htmlFor="rm-filter-terminal"
          className="cursor-pointer text-sm"
        >
          {t('pages.riskManagement.filters.showTerminal')}
        </Label>
      </div>
    </div>
  )
}
