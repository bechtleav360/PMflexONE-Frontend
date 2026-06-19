import * as React from 'react'

import { cn } from '@/shared/lib/utils'

import { useFormField } from './useFormField'

/**
 * Optional helper text displayed below a form control.
 *
 * @param props - Standard `<p>` props.
 * @param ref - Forwarded ref.
 * @returns A muted paragraph connected to the field via `id`.
 */
export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
})
FormDescription.displayName = 'FormDescription'
