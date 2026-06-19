import type * as React from 'react'

import { useDatePickerCalendarState } from './useDatePickerCalendarState'
import { useDatePickerInputInteractions } from './useDatePickerInputInteractions'
import { useDatePickerValueState } from './useDatePickerValueState'

interface UseDatePickerControllerParams {
  value?: Date | null
  defaultValue?: Date | null
  onChange?: (value: Date | null) => void
  locale: string
  formatOptions: Intl.DateTimeFormatOptions
  placeholder?: string
  disabled?: boolean
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  onFocus?: React.FocusEventHandler<HTMLInputElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
}

interface UseDatePickerControllerResult {
  rootRef: React.RefObject<HTMLDivElement | null>
  inputRef: React.RefObject<HTMLInputElement | null>
  calendarRef: React.RefObject<HTMLDivElement | null>
  inputValue: string
  isOpen: boolean
  viewDate: Date
  selectedDate: Date | null
  placeholderValue: string
  handleInputChange: React.ChangeEventHandler<HTMLInputElement>
  handleInputBlur: React.FocusEventHandler<HTMLInputElement>
  handleInputKeyDown: React.KeyboardEventHandler<HTMLInputElement>
  handleInputFocus: React.FocusEventHandler<HTMLInputElement>
  toggleCalendar: () => void
  handleSelectDate: (date: Date) => void
  goToPreviousMonth: () => void
  goToNextMonth: () => void
}

/**
 * Coordinates the shared date picker value state and calendar popover state.
 *
 * @param params - Date picker controller options.
 * @param params.value - Controlled date value.
 * @param params.defaultValue - Initial uncontrolled date value.
 * @param params.onChange - Callback fired when the selected date changes.
 * @param params.locale - Locale used for formatting and parsing.
 * @param params.formatOptions - Options for the visible date format.
 * @param params.placeholder - Optional custom placeholder text.
 * @param params.disabled - Whether the input is disabled.
 * @param params.onBlur - Optional blur handler forwarded to the text input.
 * @param params.onFocus - Optional focus handler forwarded to the text input.
 * @param params.onKeyDown - Optional keydown handler forwarded to the text input.
 * @returns Refs, state, and event handlers for the DatePicker component.
 */
export function useDatePickerController({
  value,
  defaultValue,
  onChange,
  locale,
  formatOptions,
  placeholder,
  disabled,
  onBlur,
  onFocus,
  onKeyDown,
}: UseDatePickerControllerParams): UseDatePickerControllerResult {
  const {
    inputValue,
    selectedDate,
    draftInputDate,
    placeholderValue,
    setInputValue,
    handleInputChange,
    commitDateValue,
    commitInputValue,
  } = useDatePickerValueState({
    value,
    defaultValue,
    onChange,
    locale,
    formatOptions,
    placeholder,
  })

  const {
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
  } = useDatePickerCalendarState({
    selectedDate,
    draftInputDate,
    disabled,
    onSelectDate: commitDateValue,
  })

  const { handleInputFocus, handleInputBlur, handleInputKeyDown } = useDatePickerInputInteractions({
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
  })

  return {
    rootRef,
    inputRef,
    calendarRef,
    inputValue,
    isOpen,
    viewDate,
    selectedDate,
    placeholderValue,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
    handleInputFocus,
    toggleCalendar,
    handleSelectDate,
    goToPreviousMonth,
    goToNextMonth,
  }
}
