import type { LucideIcon } from 'lucide-react'

/** Props for {@link ButtonIcon}. */
export interface ButtonIconProps {
  /** Lucide icon component to render */
  icon: LucideIcon
}

/**
 * Icon sized and spaced for use as a leading icon inside a {@link Button}.
 *
 * @param props - Component props
 * @param props.icon - Lucide icon component to render
 * @returns Icon element with button-appropriate sizing, margin, and aria-hidden
 */
export function ButtonIcon({ icon: Icon }: ButtonIconProps) {
  return (
    <Icon
      className="mr-sm h-4 w-4"
      aria-hidden="true"
    />
  )
}
