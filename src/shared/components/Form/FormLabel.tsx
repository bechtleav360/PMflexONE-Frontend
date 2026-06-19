import * as React from 'react'
import type { ComponentPropsWithoutRef, ElementRef } from 'react'

import { cn } from '@/shared/lib/utils'

import { Label } from '../Label'
import { useFormField } from './useFormField'

/**
 * Label for a form field. Automatically wires `htmlFor` to the control id and
 * applies destructive colour when the field has an error.
 *
 * @param props - Standard `<label>` props passed through to `Label`.
 * @param ref - Forwarded ref.
 * @returns A styled label connected to its form control.
 */
export const FormLabel = React.forwardRef<
  ElementRef<typeof Label>,
  ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && 'text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = 'FormLabel'
