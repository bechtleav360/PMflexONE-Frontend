import * as React from 'react'

import { cn } from '@/shared/lib/utils'

import { FormItemContext } from './formContext'

/**
 * Container for a single form field block. Generates a unique `id` used by
 * `FormLabel`, `FormControl`, and `FormMessage` to wire `htmlFor` and
 * `aria-describedby` attributes automatically.
 *
 * @param props - Standard `<div>` props.
 * @param ref - Forwarded ref.
 * @returns A `<div>` with injected form item context.
 */
export const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId()

    return (
      <FormItemContext.Provider value={{ id }}>
        <div
          ref={ref}
          className={cn('flex flex-col gap-1.5', className)}
          {...props}
        />
      </FormItemContext.Provider>
    )
  },
)
FormItem.displayName = 'FormItem'
