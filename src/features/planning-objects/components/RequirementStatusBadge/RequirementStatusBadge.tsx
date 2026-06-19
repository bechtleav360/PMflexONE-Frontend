import { useTranslation } from 'react-i18next'

import { Badge } from '@/shared/components/Badge'

import type { RequirementStatus } from '../../types/requirement.types'
import { REQUIREMENT_STATUS_LABELS } from '../../utils/enumConstants'

const STATUS_VARIANT: Record<
  RequirementStatus,
  'neutral' | 'default' | 'warning' | 'success' | 'destructive'
> = {
  NEW: 'neutral',
  ANALYSED: 'default',
  SPECIFIED: 'default',
  IMPLEMENTED: 'warning',
  TESTED: 'warning',
  ACCEPTED: 'success',
}

/** Props for {@link RequirementStatusBadge}. */
interface RequirementStatusBadgeProps {
  /** The requirement status to display. */
  status: RequirementStatus
}

/**
 * Displays the requirement lifecycle status as a coloured badge.
 *
 * Uses semantic colour tokens mapped to each status value.
 *
 * @param props - Component props.
 * @param props.status - The requirement status value.
 * @returns A badge element indicating the requirement status.
 */
export function RequirementStatusBadge({ status }: RequirementStatusBadgeProps) {
  const { t } = useTranslation()

  return <Badge variant={STATUS_VARIANT[status]}>{t(REQUIREMENT_STATUS_LABELS[status])}</Badge>
}
