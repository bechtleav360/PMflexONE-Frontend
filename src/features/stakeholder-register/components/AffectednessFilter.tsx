import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components'

/** Union of valid affectedness filter values. `'ALL'` shows all entries. */
export type AffectednessFilterValue = 'ALL' | 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'

/** Props for {@link AffectednessFilter}. */
export interface AffectednessFilterProps {
  value: AffectednessFilterValue
  onChange: (value: AffectednessFilterValue) => void
}

/**
 * Four-button toggle (All / Positive / Negative / Neutral) for filtering
 * stakeholder entries by type of affectedness.
 *
 * Each button uses `aria-pressed` semantics and is translated via `t()`.
 *
 * @param props - Component props.
 * @param props.value - The currently active filter value.
 * @param props.onChange - Callback invoked when the user selects a different filter.
 * @returns A button group for affectedness filtering.
 */
export function AffectednessFilter({ value, onChange }: AffectednessFilterProps) {
  const { t } = useTranslation()

  const options: { key: AffectednessFilterValue; label: string }[] = [
    { key: 'ALL', label: t('pages.stakeholderRegister.filter.allLabel') },
    { key: 'POSITIVE', label: t('pages.stakeholderRegister.filter.positiveLabel') },
    { key: 'NEGATIVE', label: t('pages.stakeholderRegister.filter.negativeLabel') },
    { key: 'NEUTRAL', label: t('pages.stakeholderRegister.filter.neutralLabel') },
  ]

  return (
    <div
      role="group"
      aria-label={t('pages.stakeholderRegister.filter.groupLabel')}
      className="flex gap-1"
    >
      {options.map((opt) => (
        <Button
          key={opt.key}
          variant={value === opt.key ? 'default' : 'outline'}
          size="sm"
          aria-pressed={value === opt.key}
          onClick={() => onChange(opt.key)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  )
}
