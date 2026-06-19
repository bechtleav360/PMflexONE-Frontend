import * as React from 'react'

import { cn } from '@/shared/lib/utils'

interface MatrixTableProps {
  /** Table content — should include thead and tbody elements. */
  children: React.ReactNode
  /** Optional additional CSS class names applied to the wrapper div. */
  className?: string
  /** Accessible label for the table element. */
  'aria-label'?: string
}

/**
 * A semantic table shell for rendering RASCI matrix data.
 * Renders a scrollable wrapper around a `<table>` with interactive cells
 * (each cell contains a focusable button). Accepts `aria-label` for screen
 * reader identification.
 *
 * @param children - Table content including thead and tbody elements.
 * @param className - Optional additional CSS class names for the wrapper.
 * @param aria-label - Accessible label forwarded to the table element.
 */
const MatrixTable = React.forwardRef<HTMLDivElement, MatrixTableProps>(
  ({ children, className, 'aria-label': ariaLabel }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('relative overflow-auto', className)}
      >
        <table
          aria-label={ariaLabel}
          className="w-full border-collapse text-sm"
        >
          {children}
        </table>
      </div>
    )
  },
)

MatrixTable.displayName = 'MatrixTable'

export { MatrixTable }
