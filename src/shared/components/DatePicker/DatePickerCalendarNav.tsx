import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/utils'

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-sm whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
const BUTTON_GHOST = 'hover:bg-muted'
const NAV_BUTTON = 'h-8 w-8 shrink-0 rounded-[7px] border border-border'

interface DatePickerCalendarNavProps {
  viewDate: Date
  monthFormatter: Intl.DateTimeFormat
  onPreviousMonth: () => void
  onNextMonth: () => void
}

/**
 * Month navigation header for the calendar: previous/next buttons flanking the month title.
 * @param props - Nav props.
 * @param props.viewDate - The month currently displayed.
 * @param props.monthFormatter - Formatter used to render the month label.
 * @param props.onPreviousMonth - Navigate to the previous month.
 * @param props.onNextMonth - Navigate to the next month.
 * @returns A flex row with two nav buttons and the formatted month title.
 */
export function DatePickerCalendarNav({
  viewDate,
  monthFormatter,
  onPreviousMonth,
  onNextMonth,
}: DatePickerCalendarNavProps) {
  const { t } = useTranslation()

  return (
    <div className="gap-sm flex items-center justify-between">
      <button
        type="button"
        onClick={onPreviousMonth}
        aria-label={t('shared.datePicker.previousMonth')}
        className={cn(BUTTON_BASE, BUTTON_GHOST, NAV_BUTTON)}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="text-sm font-bold">{monthFormatter.format(viewDate)}</div>
      <button
        type="button"
        onClick={onNextMonth}
        aria-label={t('shared.datePicker.nextMonth')}
        className={cn(BUTTON_BASE, BUTTON_GHOST, NAV_BUTTON)}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
