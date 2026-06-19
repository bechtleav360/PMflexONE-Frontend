import { useTranslation } from 'react-i18next'

import { Badge } from '@/shared/components'

const STATUS_CLASSES: Record<string, string> = {
  OPEN: 'border-transparent bg-warning text-warning-foreground pointer-events-none',
  IN_PROGRESS: 'border-transparent bg-info text-info-foreground pointer-events-none',
  DONE: 'border-transparent bg-success text-success-foreground pointer-events-none',
  REJECTED: 'border-transparent bg-destructive text-destructive-foreground pointer-events-none',
}

const FALLBACK_CLASS = 'border-transparent bg-muted text-muted-foreground pointer-events-none'

interface WorkItemStatusBadgeProps {
  status: string | null
}

/**
 * Badge displaying the translated label for a work item status value.
 * @param root0 - Component props.
 * @param root0.status - The status key to display, or null to show a dash.
 * @returns The status badge element.
 */
export function WorkItemStatusBadge({ status }: WorkItemStatusBadgeProps) {
  const { t } = useTranslation()

  const label = status ? t(`entities.workItem.status.${status}`, { defaultValue: status }) : '—'
  const className = status ? (STATUS_CLASSES[status] ?? FALLBACK_CLASS) : FALLBACK_CLASS

  return (
    <Badge
      className={className}
      aria-label={t('entities.workItem.statusBadgeLabel', { label })}
    >
      {label}
    </Badge>
  )
}
