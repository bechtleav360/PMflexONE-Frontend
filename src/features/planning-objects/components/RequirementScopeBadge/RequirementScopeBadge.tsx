import { useTranslation } from 'react-i18next'

import { Badge } from '@/shared/components/Badge'

import type { RequirementScope } from '../../types/requirement.types'
import { REQUIREMENT_SCOPE_LABELS } from '../../utils/enumConstants'

/** Props for {@link RequirementScopeBadge}. */
interface RequirementScopeBadgeProps {
  /** The requirement scope to display. */
  scope: RequirementScope
}

/**
 * Displays the requirement scope as a styled badge.
 *
 * IN_SCOPE uses a success colour; OUT_OF_SCOPE uses the muted/neutral style.
 *
 * @param props - Component props.
 * @param props.scope - The requirement scope value.
 * @returns A badge element indicating the requirement scope.
 */
export function RequirementScopeBadge({ scope }: RequirementScopeBadgeProps) {
  const { t } = useTranslation()

  return (
    <Badge variant={scope === 'IN_SCOPE' ? 'success' : 'neutral'}>
      {t(REQUIREMENT_SCOPE_LABELS[scope])}
    </Badge>
  )
}
