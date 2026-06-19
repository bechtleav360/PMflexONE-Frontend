import { useState } from 'react'

import { ChevronDown, Link2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components'
import { Badge } from '@/shared/components/Badge'
import { Combobox } from '@/shared/components/Combobox'
import type { ComboboxOption } from '@/shared/components/Combobox'
import { cn } from '@/shared/lib/utils'

import { useIssueEntries } from '../../hooks/useIssueEntries'
import { useLinkRiskToIssue } from '../../hooks/useLinkRiskToIssue'
import { useUnlinkRiskFromIssue } from '../../hooks/useUnlinkRiskFromIssue'
import type { ScopeType } from '../../types/scopeType'

/** Props for {@link RiskLinksSection}. */
interface RiskLinksSectionProps {
  /** ID of the risk entry being edited. */
  riskEntryId: string
  /** Currently linked issue entries. */
  linkedIssues: Array<{ id: string; entryNumber: string; name: string; status: string }>
  /** Scope context. */
  scopeType: ScopeType
  /** ID of the scoped entity. */
  scopeId: string
  /** When true, add/remove controls are hidden. */
  readOnly?: boolean
}

/**
 * Collapsible links section for the risk edit dialog.
 *
 * Renders linked issues as removable badges and a combobox for adding new links.
 * Mutations are immediate — no staging.
 *
 * @param props - Component props.
 * @returns The rendered collapsible links section.
 */
// eslint-disable-next-line max-lines-per-function -- tree/link-section component; line count driven by render structure and state handlers
export function RiskLinksSection({
  riskEntryId,
  linkedIssues,
  scopeType,
  scopeId,
  readOnly = false,
}: RiskLinksSectionProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const { data: issueEntries = [] } = useIssueEntries({ scopeType, scopeId })
  const { mutate: linkIssue } = useLinkRiskToIssue()
  const { mutate: unlinkIssue } = useUnlinkRiskFromIssue()

  const linkedIds = new Set(linkedIssues.map((i) => i.id))
  const issueOptions: ComboboxOption[] = issueEntries
    .filter((e) => !linkedIds.has(e.id))
    .map((e) => ({ value: e.id, label: `${e.entryNumber} – ${e.name}` }))

  return (
    <div className="border-border bg-muted/30 mt-4 rounded-md border">
      <Collapsible
        open={open}
        onOpenChange={setOpen}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="risk-links-content"
            className="text-foreground hover:text-foreground/80 flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
          >
            <span className="flex items-center gap-1.5">
              <Link2
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
              {t('pages.riskManagement.editRiskEntry.linksSection')}
            </span>
            <ChevronDown
              className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180')}
              aria-hidden="true"
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div
            id="risk-links-content"
            className="border-border border-t px-4 pt-3 pb-4"
          >
            <h3 className="text-foreground mb-2 text-sm font-medium">
              {t('shared.linksPanel.linkedIssues')}
            </h3>

            {linkedIssues.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {linkedIssues.map((issue) => {
                  const label = `${issue.entryNumber} – ${issue.name}`
                  return (
                    <Badge
                      key={issue.id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <span>{label}</span>
                      {!readOnly && (
                        <button
                          type="button"
                          aria-label={t('shared.linksPanel.removeAriaLabel', { name: label })}
                          className="focus-visible:ring-ring ml-1 rounded-sm focus-visible:ring-2"
                          onClick={() => unlinkIssue({ riskEntryId, issueEntryId: issue.id })}
                        >
                          <X
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                        </button>
                      )}
                    </Badge>
                  )
                })}
              </div>
            )}

            {linkedIssues.length === 0 && readOnly && (
              <p className="text-muted-foreground text-sm">{t('shared.linksPanel.empty')}</p>
            )}

            {!readOnly && (
              <Combobox
                options={issueOptions}
                value={null}
                onChange={(value) => {
                  if (value) linkIssue({ riskEntryId, issueEntryId: value })
                }}
                placeholder={t('shared.combobox.placeholder')}
                searchPlaceholder={t('shared.combobox.searchPlaceholder')}
                noResultsText={t('shared.combobox.noResults')}
              />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
