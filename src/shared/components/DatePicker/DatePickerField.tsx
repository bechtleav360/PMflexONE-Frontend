import * as React from 'react'

import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

const INPUT_GROUP_CLASS_NAME =
  'border-input bg-card text-foreground flex h-11 w-full items-stretch overflow-hidden rounded-md border transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:border-primary hover:border-border-strong'
const INPUT_CLASS_NAME =
  'placeholder:text-muted-foreground flex h-full min-w-0 flex-1 border-0 bg-transparent px-md py-xs text-base shadow-none outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:ring-0 focus-visible:ring-offset-0'
const BUTTON_BASE_CLASS_NAME =
  'inline-flex items-center justify-center gap-sm whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
const BUTTON_OUTLINE_CLASS_NAME = 'bg-card px-md hover:bg-muted hover:text-foreground'
const ICON_BUTTON_SIZE_CLASS_NAME = 'h-full w-10 shrink-0'

interface DatePickerFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'onFocus' | 'onKeyDown' | 'className'
> {
  className?: string
  inputClassName?: string
  buttonClassName?: string
  value: string
  placeholder?: string
  disabled?: boolean
  isOpen: boolean
  calendarButtonLabel: string
  inputRef: React.RefObject<HTMLInputElement | null>
  onToggleCalendar: () => void
  onInputChange: React.ChangeEventHandler<HTMLInputElement>
  onInputFocus: React.FocusEventHandler<HTMLInputElement>
  onInputBlur: React.FocusEventHandler<HTMLInputElement>
  onInputKeyDown: React.KeyboardEventHandler<HTMLInputElement>
}

/**
 * Renders the shared date picker text input and calendar toggle button.
 *
 * @param props - Component props.
 * @param props.className - Optional wrapper class name.
 * @param props.inputClassName - Additional classes for the input element.
 * @param props.buttonClassName - Additional classes for the calendar toggle button.
 * @param props.value - Current text input value.
 * @param props.placeholder - Optional placeholder text.
 * @param props.disabled - Whether the field is disabled.
 * @param props.isOpen - Whether the calendar popover is open.
 * @param props.calendarButtonLabel - Accessible label for the calendar toggle button.
 * @param props.id - Optional input id forwarded to the underlying input element.
 * @param props.inputRef - Ref forwarded to the input element.
 * @param props.onToggleCalendar - Click handler for the calendar toggle button.
 * @param props.onInputChange - Input change handler.
 * @param props.onInputFocus - Input focus handler.
 * @param props.onInputBlur - Input blur handler.
 * @param props.onInputKeyDown - Input keydown handler.
 * @returns The shared date picker input group.
 */
export function DatePickerField({
  className,
  inputClassName,
  buttonClassName,
  value,
  placeholder,
  disabled,
  isOpen,
  calendarButtonLabel,
  inputRef,
  onToggleCalendar,
  onInputChange,
  onInputFocus,
  onInputBlur,
  onInputKeyDown,
  id,
  ...inputProps
}: DatePickerFieldProps) {
  return (
    <div className={cn('relative w-full', className)}>
      <div className={INPUT_GROUP_CLASS_NAME}>
        <input
          {...inputProps}
          id={id}
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={value}
          onChange={onInputChange}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          onKeyDown={onInputKeyDown}
          placeholder={placeholder}
          inputMode="numeric"
          autoComplete="off"
          className={cn(INPUT_CLASS_NAME, inputClassName)}
        />
        <button
          type="button"
          disabled={disabled}
          aria-label={calendarButtonLabel}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          onClick={onToggleCalendar}
          className={cn(
            BUTTON_BASE_CLASS_NAME,
            BUTTON_OUTLINE_CLASS_NAME,
            ICON_BUTTON_SIZE_CLASS_NAME,
            buttonClassName,
          )}
        >
          <CalendarIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
