/**
 * Six fixed PESTEL category values used to classify all risk and problem entries.
 * The letter E appears twice in PESTEL (Economic, Environmental); full-word
 * string values are used to keep them unambiguous.
 */
export const PESTEL_CATEGORY = {
  POLITICAL: 'POLITICAL',
  ECONOMIC: 'ECONOMIC',
  SOCIAL: 'SOCIAL',
  TECHNOLOGICAL: 'TECHNOLOGICAL',
  ENVIRONMENTAL: 'ENVIRONMENTAL',
  LEGAL: 'LEGAL',
} as const

/** Union type of all valid PESTEL category string values. */
export type PestelCategory = (typeof PESTEL_CATEGORY)[keyof typeof PESTEL_CATEGORY]

/**
 * Ordered array of PESTEL options for use in Select components.
 * Each entry carries the raw value and the i18n key suffix for its display label.
 */
export const PESTEL_OPTIONS: { value: PestelCategory; labelKey: string }[] = [
  { value: PESTEL_CATEGORY.POLITICAL, labelKey: 'pages.riskRegister.pestel.POLITICAL' },
  { value: PESTEL_CATEGORY.ECONOMIC, labelKey: 'pages.riskRegister.pestel.ECONOMIC' },
  { value: PESTEL_CATEGORY.SOCIAL, labelKey: 'pages.riskRegister.pestel.SOCIAL' },
  { value: PESTEL_CATEGORY.TECHNOLOGICAL, labelKey: 'pages.riskRegister.pestel.TECHNOLOGICAL' },
  { value: PESTEL_CATEGORY.ENVIRONMENTAL, labelKey: 'pages.riskRegister.pestel.ENVIRONMENTAL' },
  { value: PESTEL_CATEGORY.LEGAL, labelKey: 'pages.riskRegister.pestel.LEGAL' },
]

/**
 * Maps `{ value, labelKey }` option objects to `{ value, label }` using the given translate function.
 *
 * @param options - Array of option objects with a raw value and an i18n key.
 * @param t - Translation function (e.g. from `useTranslation`).
 * @returns Array of `{ value, label }` objects ready for use in Select/Combobox components.
 */
export function translateOptions(
  options: readonly { value: string; labelKey: string }[],
  t: (key: string) => string,
): { value: string; label: string }[] {
  return options.map((o) => ({ value: o.value, label: t(o.labelKey) }))
}
