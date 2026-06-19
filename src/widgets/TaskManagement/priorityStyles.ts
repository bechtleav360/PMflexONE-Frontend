import { ArrowDown, ArrowUp, ChevronsUp, CircleDashed, Minus } from 'lucide-react'

/** A set of priority key strings used for filtering. */
export type PriorityFilterSet = ReadonlySet<string>

/** Visual style configuration for each priority level using semantic design tokens. */
export const PRIORITY_STYLE: Record<
  string,
  { icon: React.ElementType; className: string; badge: string; activeBadge: string }
> = {
  VERY_HIGH: {
    icon: ChevronsUp,
    className: 'text-destructive',
    badge: 'border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20',
    activeBadge:
      'border-destructive/60 bg-destructive/20 text-destructive ring-2 ring-destructive/50 ring-offset-1',
  },
  HIGH: {
    icon: ArrowUp,
    className: 'text-warning',
    badge: 'border-warning/30 bg-warning/10 text-warning hover:bg-warning/20',
    activeBadge:
      'border-warning/60 bg-warning/20 text-warning ring-2 ring-warning/50 ring-offset-1',
  },
  MEDIUM: {
    icon: Minus,
    className: 'text-info',
    badge: 'border-info/30 bg-info/10 text-info hover:bg-info/20',
    activeBadge: 'border-info/60 bg-info/20 text-info ring-2 ring-info/50 ring-offset-1',
  },
  LOW: {
    icon: ArrowDown,
    className: 'text-muted-foreground',
    badge: 'border-border bg-muted/40 text-muted-foreground hover:bg-muted',
    activeBadge: 'border-border bg-muted text-foreground ring-2 ring-border ring-offset-1',
  },
  none: {
    icon: CircleDashed,
    className: 'text-muted-foreground',
    badge: 'border-border bg-muted/40 text-muted-foreground hover:bg-muted',
    activeBadge: 'border-border bg-muted text-foreground ring-2 ring-border ring-offset-1',
  },
}
