import * as React from 'react'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/utils'

import { useFormField } from './useFormField'

/**
 * Renders the React Hook Form validation error message for the current field.
 * Uses `aria-live="polite"` so screen readers announce new errors.
 * When no error is present, renders nothing (returns `null`).
 *
 * Schemas must set `error.message` to an i18n key (e.g. `'validation.required'`).
 * The `t()` call translates it; if the key is missing i18next returns the key
 * as-is so no translation is silently lost.
 *
 * @param props - Standard `<p>` props; `children` overrides the RHF message.
 * @param ref - Forwarded ref.
 * @returns A destructive error paragraph or `null`.
 */
export const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const { t } = useTranslation()
  const errorMsg = String(error?.message ?? '')
  const body = error ? t(errorMsg, errorMsg) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      role="alert"
      aria-live="polite"
      className={cn('text-destructive text-sm font-medium', className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = 'FormMessage'
