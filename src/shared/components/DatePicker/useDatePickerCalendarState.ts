import * as React from 'react'

interface UseDatePickerCalendarStateParams {
  selectedDate: Date | null
  draftInputDate: Date | null
  disabled?: boolean
  onSelectDate?: (date: Date) => void
}

interface UseDatePickerCalendarStateResult {
  rootRef: React.RefObject<HTMLDivElement | null>
  inputRef: React.RefObject<HTMLInputElement | null>
  calendarRef: React.RefObject<HTMLDivElement | null>
  isOpen: boolean
  viewDate: Date
  closeCalendar: () => void
  toggleCalendar: () => void
  handleSelectDate: (date: Date) => void
  goToPreviousMonth: () => void
  goToNextMonth: () => void
}

/**
 * Manages the popover state and visible month for the shared date picker.
 *
 * @param params - Calendar state options.
 * @param params.selectedDate - Currently selected date.
 * @param params.draftInputDate - Parsed draft date from the text input.
 * @param params.disabled - Whether the input is disabled.
 * @param params.onSelectDate - Callback invoked after the user selects a date.
 * @returns Stable refs and calendar interaction helpers.
 */
export function useDatePickerCalendarState({
  selectedDate,
  draftInputDate,
  disabled,
  onSelectDate,
}: UseDatePickerCalendarStateParams): UseDatePickerCalendarStateResult {
  const [isOpen, setIsOpen] = React.useState(false)
  const [viewDate, setViewDate] = React.useState(() => selectedDate ?? draftInputDate ?? new Date())
  const rootRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const calendarRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!isOpen || !selectedDate) {
      return
    }

    setViewDate(selectedDate)
  }, [isOpen, selectedDate])

  React.useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const closeCalendar = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggleCalendar = React.useCallback(() => {
    if (disabled) {
      return
    }

    if (isOpen) {
      closeCalendar()
      return
    }

    setViewDate(draftInputDate ?? selectedDate ?? new Date())
    setIsOpen(true)
  }, [closeCalendar, disabled, draftInputDate, isOpen, selectedDate])

  const handleSelectDate = React.useCallback(
    (date: Date) => {
      onSelectDate?.(date)
      setViewDate(date)
      closeCalendar()
      inputRef.current?.focus()
    },
    [closeCalendar, onSelectDate],
  )

  const goToPreviousMonth = React.useCallback(() => {
    setViewDate((currentDate) => new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }, [])

  const goToNextMonth = React.useCallback(() => {
    setViewDate((currentDate) => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }, [])

  return {
    rootRef,
    inputRef,
    calendarRef,
    isOpen,
    viewDate,
    closeCalendar,
    toggleCalendar,
    handleSelectDate,
    goToPreviousMonth,
    goToNextMonth,
  }
}
