import { argbToInlineColor } from '@/shared/utils/colorUtils'

/**
 * Opaque black ARGB — used as default when a label has no colour assigned.
 * Raw hex is intentional: this is a runtime ARGB palette value (user data),
 * not a design token. Exempt from the index.css hex rule per the same
 * exception that applies to argbToInlineColor in colorUtils.ts.
 */
export const FALLBACK_LABEL_COLOR = '#FF000000'

/**
 * Props for the {@link LabelBadge} component.
 * @property name - Label display name.
 * @property color - ARGB hex color string (`#AARRGGBB`). Defaults to opaque black when absent.
 * @property className - Optional additional class names.
 */
export interface LabelBadgeProps {
  name: string
  /** ARGB color string (`#AARRGGBB`). Defaults to opaque black when absent. */
  color?: string | null
  className?: string
}

/**
 * Pill badge rendering a label's name with its ARGB color as background.
 * @param root0 - Component props.
 * @param root0.name - Label display name.
 * @param root0.color - ARGB hex color string.
 * @param root0.className - Optional additional class names.
 * @returns The label badge element.
 */
export function LabelBadge({ name, color, className }: LabelBadgeProps) {
  return (
    <span
      className={[
        'border-border text-foreground inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: argbToInlineColor(color ?? FALLBACK_LABEL_COLOR) }}
        aria-hidden
      />
      {name}
    </span>
  )
}
