import * as React from 'react'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/utils'

import { DatePickerCalendarNav } from './DatePickerCalendarNav'
import { buildCalendarDays, formatCalendarDayLabel, getWeekdayLabels } from './datePickerUtils'

const MONTH_LABELS: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' }
const BUTTON_BASE_CLASS_NAME =
  'inline-flex items-center justify-center gap-sm whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
const BUTTON_GHOST_CLASS_NAME = 'hover:bg-muted'

interface DatePickerCalendarContentProps {
  selectedDate: Date | null
  viewDate: Date
  locale: string
  minDate?: Date
  maxDate?: Date
  showTodayButton?: boolean
  onPreviousMonth: () => void
  onNextMonth: () => void
  onSelectDate: (date: Date) => void
  onGoToToday?: () => void
}

/**
 * Calendar grid with navigation controls rendered inside the DatePicker popover.
 * @param props - Calendar content props.
 * @param props.selectedDate - Currently selected date, or null.
 * @param props.viewDate - Month currently rendered.
 * @param props.locale - BCP 47 locale for month/day labels.
 * @param props.minDate - Optional lower bound for selectable dates.
 * @param props.maxDate - Optional upper bound for selectable dates.
 * @param props.showTodayButton - Whether to render the "Today" shortcut.
 * @param props.onPreviousMonth - Move the view to the previous month.
 * @param props.onNextMonth - Move the view to the next month.
 * @param props.onSelectDate - Called when the user picks a day.
 * @param props.onGoToToday - Called when the "Today" button is clicked.
 * @returns The calendar header, weekday row, day grid, and optional Today button.
 */
export function DatePickerCalendarContent({
  selectedDate,
  viewDate,
  locale,
  minDate,
  maxDate,
  showTodayButton,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
  onGoToToday,
}: DatePickerCalendarContentProps) {
  const { t } = useTranslation()
  const today = React.useMemo(() => new Date(), [])
  const monthFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(locale, MONTH_LABELS),
    [locale],
  )
  const weekdayLabels = React.useMemo(() => getWeekdayLabels(locale), [locale])
  const calendarDays = React.useMemo(
    () => buildCalendarDays(viewDate, minDate, maxDate),
    [viewDate, minDate, maxDate],
  )

  return (
    <>
      <DatePickerCalendarNav
        viewDate={viewDate}
        monthFormatter={monthFormatter}
        onPreviousMonth={onPreviousMonth}
        onNextMonth={onNextMonth}
      />

      <div className="text-muted-foreground mt-md gap-xs grid grid-cols-7 text-center">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="py-xs text-[11px] font-bold tracking-[.05em] uppercase"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="mt-sm gap-xs grid grid-cols-7">
        {calendarDays.map(({ date, isCurrentMonth, isDisabled }) => {
          const isSelected = selectedDate
            ? date.toDateString() === selectedDate.toDateString()
            : false
          const isToday = date.toDateString() === today.toDateString()
          const dayNumber = date.getDate()

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={isDisabled}
              aria-pressed={isSelected}
              aria-current={isToday ? 'date' : undefined}
              aria-label={formatCalendarDayLabel(date, locale)}
              onClick={() => onSelectDate(date)}
              className={cn(
                BUTTON_BASE_CLASS_NAME,
                isSelected
                  ? 'bg-primary text-primary-foreground shadow'
                  : isToday
                    ? 'border-primary text-primary border-[1.5px] font-bold'
                    : BUTTON_GHOST_CLASS_NAME,
                'h-[34px] w-[34px] rounded-[7px] text-sm',
                !isCurrentMonth && 'text-muted-foreground opacity-60',
              )}
            >
              {dayNumber}
            </button>
          )
        })}
      </div>

      {showTodayButton && (
        <div className="border-border mt-sm pt-sm flex justify-end border-t">
          <button
            type="button"
            onClick={onGoToToday}
            className={cn(
              BUTTON_BASE_CLASS_NAME,
              BUTTON_GHOST_CLASS_NAME,
              'h-7 rounded-md px-2.5 text-xs',
            )}
          >
            {t('shared.datePicker.today')}
          </button>
        </div>
      )}
    </>
  )
}
