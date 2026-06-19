import { useState } from 'react'

import { CalendarIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/Popover'
import { cn } from '@/shared/lib/utils'

import { YearPickerDropdown } from './YearPickerDropdown'

interface YearPickerProps {
  id?: string
  value: number | null
  onChange: (year: number | null) => void
  className?: string
  'aria-describedby'?: string
  hasError?: boolean
}

const GRID_SIZE = 12

function decadeStart(year: number): number {
  return Math.floor(year / 10) * 10
}

/**
 * Standalone year picker — trigger button with calendar icon that opens a decade grid popover.
 * Does not include a label or error display; compose those externally.
 *
 * @param props - Component props.
 * @param props.id - HTML id forwarded to the trigger button.
 * @param props.value - Controlled numeric year value, or null when nothing is selected.
 * @param props.onChange - Called with the selected year number, or null when cleared.
 * @param props.className - Additional classes for the trigger button.
 * @param props.hasError - When true, renders the trigger border in the destructive colour token.
 * @returns A year picker trigger and popover.
 */
export function YearPicker({
  id,
  value,
  onChange,
  className,
  'aria-describedby': ariaDescribedby,
  hasError,
}: YearPickerProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [decade, setDecade] = useState(() => decadeStart(value ?? new Date().getFullYear()))
  const [prevValue, setPrevValue] = useState(value)

  if (prevValue !== value) {
    setPrevValue(value)
    setDecade(decadeStart(value ?? decade))
  }

  const years = Array.from({ length: GRID_SIZE }, (_, i) => decade + i)

  function select(year: number) {
    onChange(year)
    setOpen(false)
  }

  function clear() {
    onChange(null)
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-describedby={ariaDescribedby}
          className={cn(
            'border-input ring-offset-background flex h-11 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors',
            'focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError ? 'border-destructive' : '',
            value === null ? 'text-muted-foreground' : 'text-foreground',
            className,
          )}
        >
          <span>{value !== null ? value : t('shared.yearPicker.placeholder')}</span>
          <CalendarIcon
            className="text-muted-foreground h-4 w-4"
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-[--radix-popover-trigger-width] overflow-hidden p-0"
      >
        <YearPickerDropdown
          label={t('shared.yearPicker.label')}
          decade={decade}
          gridSize={GRID_SIZE}
          years={years}
          value={value}
          onPrevDecade={() => setDecade((d) => d - GRID_SIZE)}
          onNextDecade={() => setDecade((d) => d + GRID_SIZE)}
          onSelect={select}
          onClear={clear}
        />
      </PopoverContent>
    </Popover>
  )
}
