import { Pencil, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, ButtonIcon } from '@/shared/components'

interface ProjectDetailActionsProps {
  pirSummary: { id: string; status: string | null } | null | undefined
  bcSummary: { id: string; status: string } | null | undefined
  charterSummary: { id: string } | null | undefined
  onOpenPIR: () => void
  onOpenBC: () => void
  onOpenCharter: () => void
}

/**
 * Renders the primary action buttons on the Project Detail page.
 * Each button opens the corresponding dialog (PIR / Business Case / Project Charter).
 *
 * @param props - Component props.
 * @param props.pirSummary - Existing PIR summary, or null/undefined if none exists.
 * @param props.bcSummary - Existing Business Case summary, or null/undefined if none exists.
 * @param props.charterSummary - Existing Project Charter summary, or null/undefined if none exists.
 * @param props.onOpenPIR - Callback to open the PIR create/view dialog.
 * @param props.onOpenBC - Callback to open the Business Case create/view dialog.
 * @param props.onOpenCharter - Callback to open the Project Charter create/edit dialog.
 * @returns The action buttons section element.
 */
export function ProjectDetailActions({
  pirSummary,
  bcSummary,
  charterSummary,
  onOpenPIR,
  onOpenBC,
  onOpenCharter,
}: ProjectDetailActionsProps) {
  const { t } = useTranslation()
  const hasAcceptedPIR = pirSummary?.status === 'accepted'

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Button onClick={onOpenPIR}>
        <ButtonIcon icon={pirSummary ? Pencil : Plus} />
        {pirSummary
          ? t('pages.projectDetail.actions.viewPIR')
          : t('pages.projectDetail.actions.createPIR')}
      </Button>

      <Button
        onClick={onOpenBC}
        disabled={!hasAcceptedPIR}
      >
        <ButtonIcon icon={bcSummary ? Pencil : Plus} />
        {bcSummary
          ? t('pages.projectDetail.actions.viewBusinessCase')
          : t('pages.projectDetail.actions.createBusinessCase')}
      </Button>

      <Button
        onClick={onOpenCharter}
        disabled={!hasAcceptedPIR}
      >
        <ButtonIcon icon={charterSummary ? Pencil : Plus} />
        {charterSummary
          ? t('pages.projectCharter.actions.viewEditProjectCharter')
          : t('pages.projectCharter.actions.startProjectCharter')}
      </Button>
    </div>
  )
}
