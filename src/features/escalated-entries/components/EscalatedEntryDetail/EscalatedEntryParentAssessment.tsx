import { useTranslation } from 'react-i18next'

interface EscalatedEntryParentAssessmentProps {
  title: string
  targetProbability: number | null
  targetImpact: number | null
}

/**
 * Displays a parent scope's target probability and impact assessment fields.
 * @param props - Component props.
 * @param props.title - Section heading (e.g. program or portfolio name).
 * @param props.targetProbability - Numeric target probability, or null when not yet assessed.
 * @param props.targetImpact - Numeric target impact, or null when not yet assessed.
 * @returns A labelled section with target probability and impact definition terms.
 */
export function EscalatedEntryParentAssessment({
  title,
  targetProbability,
  targetImpact,
}: EscalatedEntryParentAssessmentProps) {
  const { t } = useTranslation()

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <dl className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs font-medium">
            {t('features.escalatedEntries.detail.assessment.targetProbability')}
          </dt>
          <dd className="text-sm">
            {targetProbability ?? (
              <span className="text-muted-foreground">
                {t('features.escalatedEntries.detail.parentAssessment.notAssessed')}
              </span>
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs font-medium">
            {t('features.escalatedEntries.detail.assessment.targetImpact')}
          </dt>
          <dd className="text-sm">
            {targetImpact ?? (
              <span className="text-muted-foreground">
                {t('features.escalatedEntries.detail.parentAssessment.notAssessed')}
              </span>
            )}
          </dd>
        </div>
      </dl>
    </section>
  )
}
