import { useTranslation } from 'react-i18next'

import type { ProjectWorkItem } from '@/entities/work-item'

import { CardPriorityBadge } from './CardPriorityBadge'
import { PRIORITY_ICON } from './priorityIconMap'

/**
 * Renders the priority badge for a board card, or null when no priority is set.
 * @param root0 - Component props.
 * @param root0.workItem - The work item whose priority to display.
 * @returns The priority badge element, or null.
 */
export function PrioritySection({ workItem }: { workItem: ProjectWorkItem }) {
  const { t } = useTranslation()
  if (!workItem.priority) return null
  const icon = PRIORITY_ICON[workItem.priority]
  const label = t(`entities.workItem.priority.${workItem.priority}`, workItem.priority)
  if (!icon || !label) return null
  return (
    <CardPriorityBadge
      icon={icon.icon}
      className={icon.className}
      label={label}
    />
  )
}
