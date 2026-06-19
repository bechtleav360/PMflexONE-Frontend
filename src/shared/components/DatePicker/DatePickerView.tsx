import * as React from 'react'

import * as PopoverPrimitive from '@radix-ui/react-popover'

import { DatePickerCalendar } from './DatePickerCalendar'
import { DatePickerField } from './DatePickerField'

interface DatePickerViewProps {
  className?: string
  inputClassName?: string
  calendarClassName?: string
  buttonClassName?: string
  id?: string
  disabled?: boolean
  inputProps?: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    | 'type'
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'onBlur'
    | 'onFocus'
    | 'onKeyDown'
    | 'className'
  >
  inputValue: string
  placeholderValue: string
  isOpen: boolean
  minDate?: Date
  maxDate?: Date
  locale: string
  selectedDate: Date | null
  viewDate: Date
  rootRef: React.RefObject<HTMLDivElement | null>
  inputRef: React.RefObject<HTMLInputElement | null>
  calendarRef: React.RefObject<HTMLDivElement | null>
  calendarButtonLabel: string
  handleInputChange: React.ChangeEventHandler<HTMLInputElement>
  handleInputBlur: React.FocusEventHandler<HTMLInputElement>
  handleInputKeyDown: React.KeyboardEventHandler<HTMLInputElement>
  handleInputFocus: React.FocusEventHandler<HTMLInputElement>
  toggleCalendar: () => void
  goToPreviousMonth: () => void
  goToNextMonth: () => void
  handleSelectDate: (date: Date) => void
  showTodayButton?: boolean
  handleGoToToday?: () => void
}

/**
 * Combines the shared date picker field and calendar popover.
 *
 * @param props - Render props produced by the DatePicker controller.
 * @returns The complete date picker UI.
 */
export function DatePickerView(props: DatePickerViewProps) {
  const {
    className,
    inputClassName,
    calendarClassName,
    buttonClassName,
    id,
    disabled,
    inputValue,
    placeholderValue,
    isOpen,
    minDate,
    maxDate,
    locale,
    selectedDate,
    viewDate,
    rootRef,
    inputRef,
    calendarRef,
    calendarButtonLabel,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
    handleInputFocus,
    toggleCalendar,
    goToPreviousMonth,
    goToNextMonth,
    handleSelectDate,
    showTodayButton,
    handleGoToToday,
    inputProps,
  } = props

  return (
    <PopoverPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (open !== isOpen) toggleCalendar()
      }}
    >
      <div
        ref={rootRef}
        className={className}
      >
        <PopoverPrimitive.Anchor asChild>
          <div className="w-full">
            <DatePickerField
              {...inputProps}
              id={id}
              inputClassName={inputClassName}
              buttonClassName={buttonClassName}
              value={inputValue}
              placeholder={placeholderValue}
              disabled={disabled}
              isOpen={isOpen}
              calendarButtonLabel={calendarButtonLabel}
              inputRef={inputRef}
              onToggleCalendar={toggleCalendar}
              onInputChange={handleInputChange}
              onInputFocus={handleInputFocus}
              onInputBlur={handleInputBlur}
              onInputKeyDown={handleInputKeyDown}
            />
          </div>
        </PopoverPrimitive.Anchor>
        <DatePickerCalendar
          isOpen={isOpen}
          calendarRef={calendarRef}
          selectedDate={selectedDate}
          viewDate={viewDate}
          locale={locale}
          minDate={minDate}
          maxDate={maxDate}
          calendarClassName={calendarClassName}
          showTodayButton={showTodayButton}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onSelectDate={handleSelectDate}
          onGoToToday={handleGoToToday}
        />
      </div>
    </PopoverPrimitive.Root>
  )
}
