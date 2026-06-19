import { useTranslation } from 'react-i18next'

import type { ProjectWorkItem } from '@/entities/work-item'

import { PRIORITY_STYLE } from './priorityStyles'

/** Props for the PriorityIcon component. */
interface PriorityIconProps {
  wi: ProjectWorkItem
}

/**
 * Renders a priority icon for the given work item, or an empty placeholder span.
 * @param root0 - Component props.
 * @param root0.wi - The work item whose priority icon to display.
 * @returns The priority icon element.
 */
export function PriorityIcon({ wi }: PriorityIconProps) {
  const { t } = useTranslation()
  const pStyle = wi.priority ? PRIORITY_STYLE[wi.priority] : undefined
  if (pStyle) {
    const Icon = pStyle.icon
    return (
      <Icon
        className={`h-4 w-4 shrink-0 ${pStyle.className}`}
        aria-label={t(`entities.workItem.priority.${wi.priority}`, wi.priority ?? '')}
      />
    )
  }
  return (
    <span
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    />
  )
}
