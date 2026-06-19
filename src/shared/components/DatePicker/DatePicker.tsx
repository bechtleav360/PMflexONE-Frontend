import * as React from 'react'

import { useTranslation } from 'react-i18next'

import { DatePickerView } from './DatePickerView'
import { useDatePickerController } from './useDatePickerController'

interface DatePickerProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'defaultValue' | 'onChange'
> {
  value?: Date | null
  defaultValue?: Date | null
  onChange?: (value: Date | null) => void
  locale?: string
  formatOptions?: Intl.DateTimeFormatOptions
  minDate?: Date
  maxDate?: Date
  inputClassName?: string
  calendarClassName?: string
  buttonClassName?: string
  showTodayButton?: boolean
}

const DEFAULT_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}

/**
 * Shared date picker input with an optional calendar popover.
 *
 * @param props - Component props.
 * @param props.value - Controlled date value.
 * @param props.defaultValue - Initial uncontrolled date value.
 * @param props.onChange - Callback fired when the selected date changes.
 * @param props.locale - Optional locale override.
 * @param props.formatOptions - Optional `Intl.DateTimeFormat` options for the input value.
 * @param props.minDate - Lower selectable date bound.
 * @param props.maxDate - Upper selectable date bound.
 * @param props.inputClassName - Additional classes for the input element.
 * @param props.calendarClassName - Additional classes for the calendar popover.
 * @param props.buttonClassName - Additional classes for the calendar toggle button.
 * @returns A date input with a translated calendar popover.
 */
const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      className,
      inputClassName,
      calendarClassName,
      buttonClassName,
      value,
      defaultValue,
      onChange,
      locale,
      formatOptions,
      minDate,
      maxDate,
      disabled,
      placeholder,
      id,
      onBlur,
      onFocus,
      onKeyDown,
      showTodayButton,
      ...inputProps
    },
    ref,
  ) => {
    const { i18n, t } = useTranslation()
    const resolvedLocale = locale ?? i18n.resolvedLanguage ?? i18n.language ?? 'en'
    const resolvedFormatOptions = formatOptions ?? DEFAULT_FORMAT_OPTIONS
    const {
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
    } = useDatePickerController({
      value,
      defaultValue,
      onChange,
      locale: resolvedLocale,
      formatOptions: resolvedFormatOptions,
      placeholder,
      disabled,
      onBlur,
      onFocus,
      onKeyDown,
    })

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    const handleGoToToday = React.useCallback(() => {
      handleSelectDate(new Date())
    }, [handleSelectDate])

    return (
      <DatePickerView
        className={className}
        inputClassName={inputClassName}
        calendarClassName={calendarClassName}
        buttonClassName={buttonClassName}
        id={id}
        disabled={disabled}
        inputProps={inputProps}
        inputValue={inputValue}
        placeholderValue={placeholderValue}
        isOpen={isOpen}
        minDate={minDate}
        maxDate={maxDate}
        locale={resolvedLocale}
        selectedDate={selectedDate}
        viewDate={viewDate}
        rootRef={rootRef}
        inputRef={inputRef}
        calendarRef={calendarRef}
        calendarButtonLabel={t('shared.datePicker.openCalendar')}
        showTodayButton={showTodayButton}
        handleGoToToday={handleGoToToday}
        handleInputChange={handleInputChange}
        handleInputBlur={handleInputBlur}
        handleInputKeyDown={handleInputKeyDown}
        handleInputFocus={handleInputFocus}
        toggleCalendar={toggleCalendar}
        goToPreviousMonth={goToPreviousMonth}
        goToNextMonth={goToNextMonth}
        handleSelectDate={handleSelectDate}
      />
    )
  },
)

DatePicker.displayName = 'DatePicker'

export { DatePicker }
export type { DatePickerProps }
