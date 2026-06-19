import { useTranslation } from 'react-i18next'

import {
  getRiskLevelSrLabel,
  getRiskLevelToken,
  getRiskLevelTokenClass,
} from '../../utils/riskLevelColor'

/**
 * Displays the calculated risk level (probability × impact) as a color-coded badge.
 *
 * For **risk** entries: ≤ 2 = green, 3–19 = yellow, ≥ 20 = red.
 * For **opportunity** entries the scale is inverted: ≤ 2 = red, 3–19 = yellow, ≥ 20 = green.
 * Uses CSS design tokens — no hardcoded hex (Constitution Principle V).
 * Includes a visually-hidden `sr-only` span so screen readers receive the full label
 * (Constitution Principle IV: colour must not be the sole indicator of status).
 *
 * @param root0 - Props for the badge.
 * @param root0.riskLevel - The numeric risk level (probability × impact), or `null` when not calculated.
 * @param root0.type - Entry type: `'risk'` uses normal scale, `'opportunity'` uses inverted scale.
 * @returns A colored badge element with screen-reader accessible label.
 */
export function RiskLevelBadge({
  riskLevel,
  type,
}: {
  riskLevel: number | null
  type: 'RISK' | 'OPPORTUNITY'
}) {
  const { t } = useTranslation()
  const token = getRiskLevelToken(riskLevel, type)
  const bgClass = getRiskLevelTokenClass(token)
  const srLabel = getRiskLevelSrLabel(riskLevel, token, t)

  return (
    <span
      className={`text-primary-foreground inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${bgClass}`}
      data-testid="risk-level-badge"
      data-color={token}
    >
      {riskLevel !== null ? riskLevel : '—'}
      <span className="sr-only">{srLabel}</span>
    </span>
  )
}
