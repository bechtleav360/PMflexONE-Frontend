import { useId } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import {
  Badge,
  Checkbox,
  Label,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components'

const TERMINAL_RISK_STATUSES = new Set(['rejected', 'closed'])

/** Props for {@link AssumptionRiskSection}. */
interface AssumptionRiskSectionProps {
  /** Whether the assumption is currently flagged as a risk. */
  isRisk: boolean
  /** The risk entry linked to this assumption, or `null` if not linked. */
  linkedRisk: { id: string; name: string; status: string } | null
  /** Whether the current user has write access to the risk register. */
  hasRiskWriteAccess: boolean
  /** Called when the user toggles the isRisk checkbox. */
  onIsRiskChange: (value: boolean) => void
  /**
   * The project scope ID used to build the risk management navigation path.
   * Required when `linkedRisk` is set.
   */
  scopeId?: string
}

/**
 * Form section for the "Is a risk" checkbox and linked risk chip.
 *
 * When the user lacks write access, the checkbox is disabled and a tooltip explains why.
 * When a linked risk exists, a navigable badge is shown pointing to risk management.
 *
 * @param props - Component props.
 * @returns The rendered risk section.
 */
export function AssumptionRiskSection({
  isRisk,
  linkedRisk,
  hasRiskWriteAccess,
  onIsRiskChange,
  scopeId,
}: AssumptionRiskSectionProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const tooltipId = useId()

  const hasActiveLinkedRisk =
    linkedRisk !== null && !TERMINAL_RISK_STATUSES.has(linkedRisk.status.toLowerCase())
  const effectiveIsRisk = hasActiveLinkedRisk || isRisk

  function handleCheckedChange(checked: boolean) {
    if (!checked && hasActiveLinkedRisk) {
      return
    }
    onIsRiskChange(checked)
  }

  const checkbox = (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Checkbox
          id="assumption-is-risk"
          checked={effectiveIsRisk}
          onCheckedChange={(checked) => handleCheckedChange(checked === true)}
          disabled={!hasRiskWriteAccess}
          aria-describedby={!hasRiskWriteAccess ? tooltipId : undefined}
        />
        <Label htmlFor="assumption-is-risk">
          {t('features.planningObjects.assumptions.isRisk')}
        </Label>
      </div>
      {hasActiveLinkedRisk && (
        <p className="text-muted-foreground pl-6 text-xs">
          {t('features.planningObjects.assumptions.cannotUncheckActiveRisk')}
        </p>
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-2">
      {!hasRiskWriteAccess ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="w-fit">{checkbox}</span>
            </TooltipTrigger>
            <TooltipContent id={tooltipId}>
              {t('features.planningObjects.assumptions.riskNoAccess')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        checkbox
      )}

      {linkedRisk && scopeId && (
        <button
          type="button"
          className="focus-visible:ring-ring w-fit rounded-sm outline-none focus-visible:ring-2"
          onClick={() => void navigate(`/projects/${scopeId}/risk-management`)}
          aria-label={`${t('features.planningObjects.assumptions.riskEntry')}: ${linkedRisk.name}`}
        >
          <Badge
            variant="secondary"
            className="hover:bg-muted/80 cursor-pointer"
          >
            {/* eslint-disable-next-line react/jsx-no-literals -- template literal combines i18n string with dynamic value; extraction would split a single semantic unit */}
            {`→ ${t('features.planningObjects.assumptions.riskEntry')}: ${linkedRisk.name}`}
          </Badge>
        </button>
      )}
    </div>
  )
}
