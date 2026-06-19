import { useTranslation } from 'react-i18next'

import { useLookupBusinessCaseStatuses } from '@/entities/business-case'
import { Badge } from '@/shared/components'

const STATUS_CLASSES: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  submitted: 'bg-success/10 text-success',
  accepted: 'bg-success/10 text-success',
}

interface BusinessCaseStatusBadgeProps {
  /** The raw status string from the Business Case entity, or null when unknown. */
  status: string | null
}

/**
 * Renders a colour-coded badge for a Business Case status.
 * The human-readable label is resolved from the `businessCaseStatuses` lookup,
 * falling back to the raw status string when the lookup is still loading.
 * Colours use semantic design tokens only — no hardcoded hex or RGB values.
 *
 * @param props - Component props.
 * @param props.status - The raw status string (`"draft"` | `"submitted"`), or null.
 * @returns The status badge element.
 */
export function BusinessCaseStatusBadge({ status }: BusinessCaseStatusBadgeProps) {
  const { t } = useTranslation()
  const { data: statuses } = useLookupBusinessCaseStatuses()

  const resolvedLabel = statuses?.find((s) => s.status === status)?.description ?? status ?? '—'

  const className = status
    ? (STATUS_CLASSES[status] ?? 'bg-muted text-muted-foreground')
    : 'bg-muted text-muted-foreground'

  return (
    <Badge
      className={className}
      role="status"
      data-testid="bc-status-badge"
      aria-label={t('pages.businessCase.statusBadge.aria', { status: resolvedLabel })}
    >
      {resolvedLabel}
    </Badge>
  )
}
