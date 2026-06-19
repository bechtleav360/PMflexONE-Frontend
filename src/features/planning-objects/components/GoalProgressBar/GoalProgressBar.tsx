import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/utils'

/** Props for the GoalProgressBar component. */
interface GoalProgressBarProps {
  /** Progress value 0–100. */
  value: number
  /** Optional className for the wrapper. */
  className?: string
}

/**
 * Displays goal progress as a horizontal bar with a percentage label.
 * @param props - Component props.
 * @param props.value - Progress value 0–100.
 * @param props.className - Optional className for the wrapper.
 * @returns The rendered progress bar.
 */
function GoalProgressBar({ value, className }: GoalProgressBarProps) {
  const { t } = useTranslation()

  const clampedValue = Math.min(100, Math.max(0, value))
  const percentageLabel = `${clampedValue}%`
  const barAriaLabel = t('features.planningObjects.goals.progressAriaLabel', {
    value: clampedValue,
  })

  return (
    <div className={cn('gap-sm flex items-center', className)}>
      <div
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={barAriaLabel}
        className="bg-muted relative h-2 w-full overflow-hidden rounded-full"
      >
        <div
          className="bg-primary h-full rounded-full transition-all motion-reduce:transition-none"
          style={{ width: percentageLabel }}
        />
      </div>
      <span className="text-muted-foreground shrink-0 text-xs tabular-nums">{percentageLabel}</span>
    </div>
  )
}

GoalProgressBar.displayName = 'GoalProgressBar'

export { GoalProgressBar }
export type { GoalProgressBarProps }
