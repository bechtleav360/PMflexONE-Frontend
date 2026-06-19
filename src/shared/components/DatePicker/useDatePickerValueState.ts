import * as React from 'react'

import { formatDate, getPlaceholder, parseLocaleDate } from './datePickerUtils'

interface UseDatePickerValueStateParams {
  value?: Date | null
  defaultValue?: Date | null
  onChange?: (value: Date | null) => void
  locale: string
  formatOptions: Intl.DateTimeFormatOptions
  placeholder?: string
}

interface UseDatePickerValueStateResult {
  inputValue: string
  selectedDate: Date | null
  draftInputDate: Date | null
  placeholderValue: string
  setInputValue: React.Dispatch<React.SetStateAction<string>>
  handleInputChange: React.ChangeEventHandler<HTMLInputElement>
  commitDateValue: (nextValue: Date | null) => void
  commitInputValue: () => void
}

function syncControlledInputValue(
  isControlled: boolean,
  value: Date | null | undefined,
  locale: string,
  formatOptions: Intl.DateTimeFormatOptions,
  setInputValue: React.Dispatch<React.SetStateAction<string>>,
) {
  if (!isControlled) {
    return
  }

  setInputValue(formatDate(value ?? null, locale, formatOptions))
}

function commitDateValue(
  nextValue: Date | null,
  isControlled: boolean,
  setInternalValue: React.Dispatch<React.SetStateAction<Date | null>>,
  onChange: ((value: Date | null) => void) | undefined,
  locale: string,
  formatOptions: Intl.DateTimeFormatOptions,
  setInputValue: React.Dispatch<React.SetStateAction<string>>,
) {
  if (!isControlled) {
    setInternalValue(nextValue)
  }

  onChange?.(nextValue)
  setInputValue(formatDate(nextValue, locale, formatOptions))
}

/**
 * Manages the selected value and text input state for the shared date picker.
 *
 * @param params - Value state options.
 * @param params.value - Controlled date value.
 * @param params.defaultValue - Initial uncontrolled date value.
 * @param params.onChange - Callback fired when the selected date changes.
 * @param params.locale - Locale used for formatting and parsing.
 * @param params.formatOptions - Options for the visible date format.
 * @param params.placeholder - Optional custom placeholder text.
 * @returns The current text state and commit helpers for the DatePicker.
 */
export function useDatePickerValueState({
  value,
  defaultValue,
  onChange,
  locale,
  formatOptions,
  placeholder,
}: UseDatePickerValueStateParams): UseDatePickerValueStateResult {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState<Date | null>(defaultValue ?? null)
  const [inputValue, setInputValue] = React.useState(() =>
    formatDate(value ?? defaultValue ?? null, locale, formatOptions),
  )

  const draftInputDate = React.useMemo(
    () => parseLocaleDate(inputValue.trim(), locale),
    [inputValue, locale],
  )
  const selectedDate = draftInputDate ?? (isControlled ? (value ?? null) : internalValue)
  const placeholderValue = placeholder ?? getPlaceholder(locale, formatOptions)

  React.useEffect(() => {
    syncControlledInputValue(isControlled, value, locale, formatOptions, setInputValue)
  }, [formatOptions, isControlled, locale, value])

  const commitDateValueCallback = React.useCallback(
    (nextValue: Date | null) => {
      commitDateValue(
        nextValue,
        isControlled,
        setInternalValue,
        onChange,
        locale,
        formatOptions,
        setInputValue,
      )
    },
    [formatOptions, isControlled, locale, onChange],
  )

  const commitInputValue = React.useCallback(() => {
    const trimmedValue = inputValue.trim()

    if (!trimmedValue) {
      commitDateValueCallback(null)
      return
    }

    const parsedValue = parseLocaleDate(trimmedValue, locale)

    if (parsedValue) {
      commitDateValueCallback(parsedValue)
      return
    }

    setInputValue(formatDate(selectedDate, locale, formatOptions))
  }, [commitDateValueCallback, formatOptions, inputValue, locale, selectedDate])

  const handleInputChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      setInputValue(event.target.value)
    },
    [],
  )

  return {
    inputValue,
    selectedDate,
    draftInputDate,
    placeholderValue,
    setInputValue,
    handleInputChange,
    commitDateValue: commitDateValueCallback,
    commitInputValue,
  }
}
