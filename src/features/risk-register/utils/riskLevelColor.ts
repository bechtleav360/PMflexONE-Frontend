import type { TFunction } from 'i18next'

/**
 * Color token for risk level visualization. Corresponds to CSS custom properties
 * defined in src/index.css: --risk-level-green, -yellow, -red, -gray.
 */
export type RiskLevelToken = 'green' | 'yellow' | 'red' | 'gray'

/**
 * Computes the risk level color token from a numeric riskLevel and entry type.
 *
 * Risk scale (normal):
 *   null → gray (not calculated)
 *   ≤ 2  → green (acceptable)
 *   3–19 → yellow (risk strategy recommended)
 *   ≥ 20 → red (immediate action required)
 *
 * Opportunity scale (inverted — higher opportunity level = better):
 *   null → gray (not calculated)
 *   ≤ 2  → red (opportunity at risk)
 *   3–19 → yellow (moderate opportunity)
 *   ≥ 20 → green (strong opportunity)
 *
 * @param riskLevel - The numeric risk level (probability × impact), or `null`.
 * @param type - Entry type: `'risk'` uses the normal scale, `'opportunity'` uses the inverted scale.
 * @returns The color token corresponding to the risk level.
 */
export function getRiskLevelToken(
  riskLevel: number | null,
  type: 'RISK' | 'OPPORTUNITY',
): RiskLevelToken {
  if (riskLevel === null) return 'gray'
  if (riskLevel <= 2) return type === 'RISK' ? 'green' : 'red'
  if (riskLevel <= 19) return 'yellow'
  return type === 'RISK' ? 'red' : 'green'
}

/**
 * Maps a risk level token to a Tailwind CSS class that applies the corresponding
 * design-token color as a background.
 *
 * Uses semantic token classes registered via `@theme inline` in `index.css`
 * (`--color-risk-level-*`), which map to `bg-risk-level-*` utility classes.
 *
 * @param token - The risk level token from {@link getRiskLevelToken}.
 * @returns A Tailwind CSS class string for the token background color.
 */
export function getRiskLevelTokenClass(token: RiskLevelToken): string {
  switch (token) {
    case 'green':
      return 'bg-risk-level-green'
    case 'yellow':
      return 'bg-risk-level-yellow'
    case 'red':
      return 'bg-risk-level-red'
    default:
      return 'bg-risk-level-gray'
  }
}

/**
 * Builds the visually-hidden screen-reader label for a risk level badge.
 *
 * Per Constitution Principle IV: colour cannot be the sole indicator of status;
 * this label ensures screen-reader users receive the same information as
 * sighted users.
 *
 * @param riskLevel - The numeric risk level, or `null`.
 * @param token - The color token from {@link getRiskLevelToken}.
 * @param t - The i18next translation function from `useTranslation()`.
 * @returns A translated string for screen readers describing the risk level.
 */
export function getRiskLevelSrLabel(
  riskLevel: number | null,
  token: RiskLevelToken,
  t: TFunction,
): string {
  if (riskLevel === null || token === 'gray') {
    return t('pages.riskManagement.riskLevel.notCalculated')
  }
  return t(`pages.riskManagement.riskLevel.${token}`, { level: riskLevel })
}
