import { ArrowDown, ArrowUp, ChevronsUp, Minus } from 'lucide-react'

/** Priority icon + semantic color token mapping for board card badges. */
export const PRIORITY_ICON: Record<string, { icon: React.ElementType; className: string }> = {
  VERY_HIGH: { icon: ChevronsUp, className: 'text-destructive' },
  HIGH: { icon: ArrowUp, className: 'text-warning' },
  MEDIUM: { icon: Minus, className: 'text-info' },
  LOW: { icon: ArrowDown, className: 'text-muted-foreground' },
}
