import { useTranslation } from 'react-i18next'

import type { ProjectCharterStatus } from '@/entities/project-charter'
import { Badge } from '@/shared/components'

const STATUS_CLASSES: Record<ProjectCharterStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  SUBMITTED: 'bg-info/10 text-info',
  ACCEPTED: 'bg-success/10 text-success',
}

const STATUS_LABEL_KEYS: Record<ProjectCharterStatus, string> = {
  DRAFT: 'pages.projectCharter.statusBadge.draft',
  SUBMITTED: 'pages.projectCharter.statusBadge.submitted',
  ACCEPTED: 'pages.projectCharter.statusBadge.accepted',
}

interface ProjectCharterStatusBadgeProps {
  status: ProjectCharterStatus
}

/**
 * Renders a colour-coded badge for a Project Charter status.
 * Label is sourced from i18n translations. Colours use semantic design tokens only.
 *
 * @param props - Badge props.
 * @param props.status - The project charter status to display.
 * @returns A translated, colour-coded status badge.
 */
export function ProjectCharterStatusBadge({ status }: ProjectCharterStatusBadgeProps) {
  const { t } = useTranslation()

  const label = t(STATUS_LABEL_KEYS[status])
  const className = STATUS_CLASSES[status] ?? 'bg-muted text-muted-foreground'

  return (
    <Badge
      className={className}
      role="status"
      aria-label={t('pages.projectCharter.statusBadge.aria', { status: label })}
    >
      {label}
    </Badge>
  )
}
