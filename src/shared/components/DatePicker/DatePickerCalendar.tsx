import * as React from 'react'

import { useTranslation } from 'react-i18next'

import { PopoverContent } from '@/shared/components/Popover/Popover'
import { cn } from '@/shared/lib/utils'

import { DatePickerCalendarContent } from './DatePickerCalendarContent'

interface DatePickerCalendarProps {
  isOpen: boolean
  calendarRef: React.RefObject<HTMLDivElement | null>
  selectedDate: Date | null
  viewDate: Date
  locale: string
  minDate?: Date
  maxDate?: Date
  calendarClassName?: string
  showTodayButton?: boolean
  onPreviousMonth: () => void
  onNextMonth: () => void
  onSelectDate: (date: Date) => void
  onGoToToday?: () => void
}

/**
 * Calendar popover shell for the DatePicker — renders the popover container when open.
 * @param props - Calendar display and interaction props.
 * @param props.isOpen - Whether the calendar popover should render.
 * @param props.calendarRef - Ref attached to the popover content for outside-click detection.
 * @param props.selectedDate - Currently selected date.
 * @param props.viewDate - The month currently displayed.
 * @param props.locale - BCP 47 locale string for formatting.
 * @param props.minDate - Optional minimum selectable date.
 * @param props.maxDate - Optional maximum selectable date.
 * @param props.calendarClassName - Optional extra class for the popover content.
 * @param props.showTodayButton - Whether to show the "Today" shortcut button.
 * @param props.onPreviousMonth - Navigate to the previous month.
 * @param props.onNextMonth - Navigate to the next month.
 * @param props.onSelectDate - Called with the chosen date.
 * @param props.onGoToToday - Called when the "Today" button is clicked.
 * @returns The calendar popover content, or null when closed.
 */
export function DatePickerCalendar({
  isOpen,
  calendarRef,
  selectedDate,
  viewDate,
  locale,
  minDate,
  maxDate,
  calendarClassName,
  showTodayButton,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
  onGoToToday,
}: DatePickerCalendarProps) {
  const { t } = useTranslation()

  if (!isOpen) {
    return null
  }

  return (
    <PopoverContent
      ref={calendarRef}
      align="start"
      sideOffset={6}
      role="dialog"
      aria-label={t('shared.datePicker.calendarLabel')}
      onOpenAutoFocus={(e) => e.preventDefault()}
      className={cn('w-auto min-w-[260px] rounded-[10px] p-[14px]', calendarClassName)}
    >
      <DatePickerCalendarContent
        selectedDate={selectedDate}
        viewDate={viewDate}
        locale={locale}
        minDate={minDate}
        maxDate={maxDate}
        showTodayButton={showTodayButton}
        onPreviousMonth={onPreviousMonth}
        onNextMonth={onNextMonth}
        onSelectDate={onSelectDate}
        onGoToToday={onGoToToday}
      />
    </PopoverContent>
  )
}
