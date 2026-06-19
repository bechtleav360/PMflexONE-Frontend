import { useTranslation } from 'react-i18next'

/** Lifecycle state of an escalated entry at the target level. */
type EscalationStatus = 'ACTIVE' | 'RETURNED' | 'ESCALATED'

/**
 * Displays the escalation status of a source or escalated entry as a color-coded badge.
 *
 * - ACTIVE: `bg-warning` token (amber) — entry is locked at source level.
 * - RETURNED: `bg-muted` token (gray) — entry has been returned.
 *
 * Uses CSS design tokens — no hardcoded hex (Constitution Principle V).
 * Provides `aria-label` via t() so screen readers get the full status label.
 *
 * @param root0 - Props for the badge.
 * @param root0.status - The escalation status value.
 * @returns A color-coded badge with ARIA label.
 */
export function EscalationStatusBadge({ status }: { status: EscalationStatus }) {
  const { t } = useTranslation()
  const label = t(`features.escalatedEntries.status.${status}`)
  const ariaLabel = t('features.escalatedEntries.status.ariaLabel', { status: label })

  const bgClass =
    status === 'ACTIVE'
      ? 'bg-warning text-warning-foreground'
      : status === 'ESCALATED'
        ? 'bg-primary text-primary-foreground'
        : 'bg-muted text-muted-foreground'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${bgClass}`}
      data-testid="escalation-status-badge"
      data-status={status.toLowerCase()}
      aria-label={ariaLabel}
    >
      {label}
    </span>
  )
}
