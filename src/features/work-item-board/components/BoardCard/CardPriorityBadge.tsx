import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components'

interface CardPriorityBadgeProps {
  label: string
  icon: React.ElementType
  className: string
}

/**
 * Displays a priority icon and label inside a tooltip for a board card.
 * @param root0 - Component props.
 * @param root0.label - The translated priority label.
 * @param root0.icon - The icon component to render.
 * @param root0.className - The color class name for the icon.
 * @returns A tooltip-wrapped priority badge element.
 */
export function CardPriorityBadge({ label, icon: Icon, className }: CardPriorityBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`flex shrink-0 cursor-default items-center gap-1 text-xs font-medium ${className}`}
          aria-label={label}
        >
          <Icon className="h-4 w-4" />
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
