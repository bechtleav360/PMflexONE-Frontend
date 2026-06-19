import * as React from 'react'

import type { PermissionKey } from '@/shared/lib/rasci'
import { cn } from '@/shared/lib/utils'

interface RasciValueBadgeProps {
  /** The RASCI permission key to display. */
  value: PermissionKey
  /** Optional additional CSS class names. */
  className?: string
}

/**
 * Displays a RASCI permission key value as a styled badge.
 * Colour is intentionally neutral — callers apply semantic colour via `className`
 * because access-level semantics depend on resource configuration, not the key alone.
 *
 * @param value - The RASCI permission key (R, A, S, C, I, or —).
 * @param className - Optional additional CSS class names.
 */
const RasciValueBadge = React.forwardRef<HTMLSpanElement, RasciValueBadgeProps>(
  ({ value, className }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded px-1.5 py-0.5 text-xs font-semibold',
          className,
        )}
      >
        {value}
      </span>
    )
  },
)

RasciValueBadge.displayName = 'RasciValueBadge'

export { RasciValueBadge }
