import { useTranslation } from 'react-i18next'

import { Badge } from '@/shared/components'

import { useLookupProgramStatus } from '../hooks/useLookupProgramStatus'

const STATUS_CLASSES: Record<string, string> = {
  created: 'bg-muted text-muted-foreground',
  active: 'bg-success/10 text-success',
  completed: 'bg-info/10 text-info',
  archived: 'bg-muted/50 text-muted-foreground',
}

/** Props for {@link ProgramStatusBadge}. */
interface ProgramStatusBadgeProps {
  /** The program's raw status code, e.g. `'active'`. Pass `null` to render an em-dash. */
  status: string | null
}

/**
 * Colour-coded badge displaying a program's current status.
 *
 * The human-readable label is resolved from the i18n `pages.programs.status.*`
 * namespace, falling back to the server-side description or the raw code.
 * The accessible name is set via `aria-label` so screen readers announce the
 * full "Status: …" phrase rather than just the badge text.
 *
 * @param props - Component props.
 * @param props.status - The program's raw status code.
 * @returns The rendered status badge.
 */
export function ProgramStatusBadge({ status }: ProgramStatusBadgeProps) {
  const { t } = useTranslation()
  const { data: statuses } = useLookupProgramStatus()

  const fallbackDescription = statuses?.find((s) => s.status === status)?.description
  const resolvedLabel = status
    ? t(`pages.programs.status.${status}`, { defaultValue: fallbackDescription ?? status })
    : '—'

  const className = status
    ? (STATUS_CLASSES[status] ?? 'bg-muted text-muted-foreground')
    : 'bg-muted text-muted-foreground'

  return (
    <Badge
      role="status"
      className={className}
      aria-label={t('pages.programs.statusBadge.aria', { status: resolvedLabel })}
    >
      {resolvedLabel}
    </Badge>
  )
}
