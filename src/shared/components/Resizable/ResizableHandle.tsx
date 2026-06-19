import * as React from 'react'

import { Separator } from 'react-resizable-panels'

import { cn } from '@/shared/lib/utils'

/**
 * Renders the draggable separator between resizable panels.
 *
 * Default appearance: `w-px bg-border` — a hairline border using the design-token colour.
 * Callers may override via `className`; pass a full replacement (width + background) when
 * customising, otherwise the defaults remain visible underneath merged classes.
 *
 * **Risk:** removing the default width/background via `className` makes the handle invisible
 * to callers that do not supply their own sizing. Always provide explicit width and background
 * when overriding.
 * @param props - Separator props plus an optional handle toggle.
 * @param props.className - Additional class names merged with the default separator styling.
 * @param props.withHandle - Whether to render the visual grab-dot indicator.
 * @returns The rendered resize handle.
 */
function ResizableHandle({
  withHandle = false,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean
}) {
  return (
    <Separator
      className={cn(
        'bg-border focus-visible:ring-ring relative flex w-px cursor-col-resize items-center justify-center after:absolute after:inset-y-0 after:-right-1 after:-left-1 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-none',
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-sm border">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-2.5 w-2.5"
          >
            <circle
              cx="12"
              cy="9"
              r="1"
            />
            <circle
              cx="19"
              cy="9"
              r="1"
            />
            <circle
              cx="5"
              cy="9"
              r="1"
            />
            <circle
              cx="12"
              cy="15"
              r="1"
            />
            <circle
              cx="19"
              cy="15"
              r="1"
            />
            <circle
              cx="5"
              cy="15"
              r="1"
            />
          </svg>
        </div>
      )}
    </Separator>
  )
}

export { ResizableHandle }
