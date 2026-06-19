import * as React from 'react'

import { formatDate } from './datePickerUtils'

interface UseDatePickerInputInteractionsParams {
  rootRef: React.RefObject<HTMLDivElement | null>
  inputRef: React.RefObject<HTMLInputElement | null>
  calendarRef: React.RefObject<HTMLDivElement | null>
  selectedDate: Date | null
  locale: string
  formatOptions: Intl.DateTimeFormatOptions
  commitInputValue: () => void
  closeCalendar: () => void
  setInputValue: React.Dispatch<React.SetStateAction<string>>
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  onFocus?: React.FocusEventHandler<HTMLInputElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
}

interface UseDatePickerInputInteractionsResult {
  handleInputFocus: React.FocusEventHandler<HTMLInputElement>
  handleInputBlur: React.FocusEventHandler<HTMLInputElement>
  handleInputKeyDown: React.KeyboardEventHandler<HTMLInputElement>
}

/**
 * Creates the shared input handlers used by the date picker.
 *
 * @param params - Input interaction options.
 * @param params.rootRef - Wrapper ref used to keep blur handling inside the widget.
 * @param params.inputRef - Input ref used for Escape handling.
 * @param params.calendarRef - Calendar popover ref used to detect focus moving into the calendar.
 * @param params.selectedDate - Currently selected date.
 * @param params.locale - Locale used for formatting.
 * @param params.formatOptions - Date formatting options.
 * @param params.commitInputValue - Commits the current draft input value.
 * @param params.closeCalendar - Closes the calendar popover.
 * @param params.setInputValue - Updates the visible text value.
 * @param params.onBlur - Optional blur handler forwarded from the consumer.
 * @param params.onFocus - Optional focus handler forwarded from the consumer.
 * @param params.onKeyDown - Optional keydown handler forwarded from the consumer.
 * @returns Focus, blur, and keyboard handlers for the date picker input.
 */
export function useDatePickerInputInteractions({
  rootRef,
  inputRef,
  calendarRef,
  selectedDate,
  locale,
  formatOptions,
  commitInputValue,
  closeCalendar,
  setInputValue,
  onBlur,
  onFocus,
  onKeyDown,
}: UseDatePickerInputInteractionsParams): UseDatePickerInputInteractionsResult {
  const handleInputFocus = React.useCallback<React.FocusEventHandler<HTMLInputElement>>(
    (event) => {
      onFocus?.(event)
    },
    [onFocus],
  )

  const handleInputBlur = React.useCallback<React.FocusEventHandler<HTMLInputElement>>(
    (event) => {
      const relatedTarget = event.relatedTarget as Node | null

      if (
        relatedTarget &&
        (rootRef.current?.contains(relatedTarget) || calendarRef.current?.contains(relatedTarget))
      ) {
        onBlur?.(event)
        return
      }

      commitInputValue()
      closeCalendar()
      onBlur?.(event)
    },
    [calendarRef, closeCalendar, commitInputValue, onBlur, rootRef],
  )

  const handleInputKeyDown = React.useCallback<React.KeyboardEventHandler<HTMLInputElement>>(
    (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        commitInputValue()
        closeCalendar()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        setInputValue(formatDate(selectedDate, locale, formatOptions))
        closeCalendar()
        inputRef.current?.blur()
      }

      onKeyDown?.(event)
    },
    [
      closeCalendar,
      commitInputValue,
      formatOptions,
      inputRef,
      locale,
      onKeyDown,
      selectedDate,
      setInputValue,
    ],
  )

  return {
    handleInputFocus,
    handleInputBlur,
    handleInputKeyDown,
  }
}
