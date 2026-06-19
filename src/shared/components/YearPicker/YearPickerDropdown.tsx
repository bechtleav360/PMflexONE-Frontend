import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { EN_DASH } from '@/shared/lib/constants'
import { cn } from '@/shared/lib/utils'

interface YearPickerDropdownProps {
  /** Accessible group label for the decade grid (forwarded to aria-label). */
  label: string
  /** First year of the currently displayed decade. */
  decade: number
  /** Number of year cells in the grid (typically 12). */
  gridSize: number
  /** Year values rendered as selectable cells. */
  years: number[]
  /** Currently selected year, or null when nothing is selected. */
  value: number | null
  onPrevDecade: () => void
  onNextDecade: () => void
  onSelect: (year: number) => void
  /** When provided, a "Clear" button is shown; called when the user clears the selection. */
  onClear?: () => void
}

/**
 * Shared year picker dropdown — decade navigation header and a 3-column year grid.
 *
 * @param props - Component props.
 * @returns The year picker dropdown panel.
 */
export function YearPickerDropdown({
  label,
  decade,
  gridSize,
  years,
  value,
  onPrevDecade,
  onNextDecade,
  onSelect,
  onClear,
}: YearPickerDropdownProps) {
  const { t } = useTranslation()
  return (
    <div
      role="group"
      aria-label={label}
      className="w-full"
    >
      <div className="flex items-center justify-between border-b px-2 py-1.5">
        <button
          type="button"
          aria-label={t('shared.yearPicker.prevDecade')}
          onClick={onPrevDecade}
          className="hover:bg-accent focus-visible:ring-ring rounded p-1 transition-colors focus-visible:ring-1 focus-visible:outline-none"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">
          {decade}
          {EN_DASH}
          {decade + gridSize - 1}
        </span>
        <button
          type="button"
          aria-label={t('shared.yearPicker.nextDecade')}
          onClick={onNextDecade}
          className="hover:bg-accent focus-visible:ring-ring rounded p-1 transition-colors focus-visible:ring-1 focus-visible:outline-none"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1 p-2">
        {years.map((year) => (
          <button
            key={year}
            type="button"
            aria-pressed={year === value}
            onClick={() => onSelect(year)}
            className={cn(
              'focus-visible:ring-ring rounded px-2 py-1.5 text-sm transition-colors focus-visible:ring-1 focus-visible:outline-none',
              year === value
                ? 'bg-primary text-primary-foreground font-medium'
                : 'hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {year}
          </button>
        ))}
      </div>

      {value !== null && onClear && (
        <div className="border-t px-2 py-1.5">
          <button
            type="button"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex w-full items-center gap-1.5 rounded px-2 py-1 text-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
          >
            <X
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
            {t('shared.yearPicker.clear')}
          </button>
        </div>
      )}
    </div>
  )
}
