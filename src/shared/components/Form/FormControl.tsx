import * as React from 'react'

import { Slot } from '@radix-ui/react-slot'

import { useFormField } from './useFormField'

/**
 * Wrapper that injects `id`, `aria-describedby`, and `aria-invalid` directly
 * onto its single child element (via Radix `Slot`) so assistive technology
 * can associate the control with its label and error message.
 *
 * Using `Slot` instead of a `<div>` ensures the generated `id` is applied to
 * the actual input element, making the `<FormLabel htmlFor>` association work
 * correctly for screen readers.
 *
 * @param props - Props forwarded to the child via `Slot`.
 * @param ref - Forwarded ref.
 * @returns A `Slot` that merges aria props onto its single child.
 */
export const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId}
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = 'FormControl'
