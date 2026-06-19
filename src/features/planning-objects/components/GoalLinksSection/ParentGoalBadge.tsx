import { X } from 'lucide-react'

import { Badge } from '@/shared/components/Badge'

/** Props for {@link ParentGoalBadge}. */
export interface ParentGoalBadgeProps {
  /** Display name shown in the badge. */
  name: string
  /** Visual style of the badge. */
  variant: 'secondary' | 'destructive' | 'outline'
  /** Optional content rendered after the name (e.g. a deleted-indicator label). */
  suffix?: React.ReactNode
  /** When true, the remove button is hidden. */
  readOnly: boolean
  /** Accessible label for the remove button. */
  removeAriaLabel: string
  /** Called when the remove button is clicked. */
  onRemove: () => void
}

/**
 * Renders a parent-goal badge with an optional remove button.
 *
 * @param props - Component props.
 * @returns The rendered badge.
 */
export function ParentGoalBadge({
  name,
  variant,
  suffix,
  readOnly,
  removeAriaLabel,
  onRemove,
}: ParentGoalBadgeProps) {
  return (
    <Badge
      variant={variant}
      className="flex items-center gap-1"
    >
      <span>{name}</span>
      {suffix}
      {!readOnly && (
        <button
          type="button"
          aria-label={removeAriaLabel}
          className="focus-visible:ring-ring ml-1 rounded-sm focus-visible:ring-2"
          onClick={onRemove}
        >
          <X
            className="h-3 w-3"
            aria-hidden="true"
          />
        </button>
      )}
    </Badge>
  )
}
