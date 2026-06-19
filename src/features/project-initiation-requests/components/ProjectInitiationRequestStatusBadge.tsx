import { useTranslation } from 'react-i18next'

import { Badge } from '@/shared/components'

const STATUS_CLASSES: Partial<Record<string, string>> = {
  draft: 'bg-muted text-muted-foreground',
  submitted: 'bg-primary/10 text-primary',
  accepted: 'bg-success/10 text-success',
}

interface ProjectInitiationRequestStatusBadgeProps {
  /** The raw status string from the PIR entity, or null when unknown. */
  status: string | null
}

/**
 * Renders a colour-coded badge for a project initiation request status.
 * Label is sourced from i18n translations; falls back to the raw status string.
 * Colours use semantic design tokens only — no hardcoded hex/RGB values.
 *
 * @param props - Component props.
 * @param props.status - The raw status string from the PIR entity, or null when unknown.
 * @returns The status badge.
 */
export function ProjectInitiationRequestStatusBadge({
  status,
}: ProjectInitiationRequestStatusBadgeProps) {
  const { t } = useTranslation()

  const translationKey = `pages.initiationRequests.status.${status}`
  const label = status ? t(translationKey, { defaultValue: status }) : '—'
  const className = status
    ? (STATUS_CLASSES[status] ?? 'bg-muted text-muted-foreground')
    : 'bg-muted text-muted-foreground'

  return (
    <Badge
      className={className}
      aria-label={t('pages.initiationRequests.list.statusBadgeLabel', { label })}
    >
      {label}
    </Badge>
  )
}
