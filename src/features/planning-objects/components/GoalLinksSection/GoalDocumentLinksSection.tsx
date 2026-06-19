import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/shared/components/Badge'
import { Combobox } from '@/shared/components/Combobox'
import type { ComboboxOption } from '@/shared/components/Combobox'

import type { EntityRefWithStatus } from '../../types/shared.types'

function buildOptionLabel(
  label: string,
  scopeDocument: { project?: { name: string } | null } | null | undefined,
): string {
  return scopeDocument?.project?.name ? `${label} — ${scopeDocument.project.name}` : label
}

function buildComboboxOptions(
  scopeDocument: { id: string; project?: { name: string } | null } | null | undefined,
  optionLabel: string,
): ComboboxOption[] {
  return scopeDocument ? [{ value: scopeDocument.id, label: optionLabel }] : []
}

/** Minimal shape of a project-scoped document (business case or project charter) returned by the project-level query. */
export interface ProjectScopedDocument {
  id: string
  project?: { name: string } | null
}

/** Props for {@link GoalDocumentLinksSection}. */
export interface GoalDocumentLinksSectionProps {
  /** The persisted linked document entity from the goal detail (business case or project charter). */
  linkedDocument: EntityRefWithStatus | null
  /** The project-level document fetched by the project-scoped query (used to populate the combobox). */
  scopeDocument: ProjectScopedDocument | null | undefined
  /** Staged document ID to link (not yet persisted). */
  pendingLink: string | null
  /** Updates the staged document link. */
  setPendingLink: (id: string | null) => void
  /** Whether a removal of the persisted document link is staged. */
  pendingUnlink: boolean
  /** Stages or clears the pending unlink. */
  setPendingUnlink: (v: boolean) => void
  /** i18n key used as the section heading and badge label. */
  labelKey: string
  /** Whether this section only applies to project-scoped goals. */
  isProjectScope: boolean
  /** When true, all link controls are hidden. */
  readOnly: boolean
}

/**
 * Renders a single-document link section (business case or project charter) for a goal edit form.
 *
 * Displays a badge when a document is linked; shows a combobox to add the link otherwise.
 *
 * @param props - Component props.
 * @returns The rendered document link section, or `null` when not applicable.
 */
export function GoalDocumentLinksSection({
  linkedDocument,
  scopeDocument,
  pendingLink,
  setPendingLink,
  pendingUnlink,
  setPendingUnlink,
  labelKey,
  isProjectScope,
  readOnly,
}: GoalDocumentLinksSectionProps) {
  const { t } = useTranslation()

  const effective = (linkedDocument && !pendingUnlink) || !!pendingLink
  const label = t(labelKey)
  const optionLabel = buildOptionLabel(label, scopeDocument)
  const comboboxOptions = buildComboboxOptions(scopeDocument, optionLabel)

  if (!effective && (readOnly || !isProjectScope)) return null

  return (
    <section aria-label={label}>
      <h3 className="text-foreground mb-2 text-sm font-medium">{label}</h3>
      {effective ? (
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge
            variant={pendingLink ? 'outline' : 'secondary'}
            className="flex items-center gap-1"
          >
            <span>{label}</span>
            {!readOnly && (
              <button
                type="button"
                aria-label={t('shared.linksPanel.removeAriaLabel', { name: label })}
                className="focus-visible:ring-ring ml-1 rounded-sm focus-visible:ring-2"
                onClick={() => {
                  if (pendingLink) {
                    setPendingLink(null)
                  } else {
                    setPendingUnlink(true)
                  }
                }}
              >
                <X
                  className="h-3 w-3"
                  aria-hidden="true"
                />
              </button>
            )}
          </Badge>
        </div>
      ) : (
        <Combobox
          options={comboboxOptions}
          value={null}
          onChange={(value) => {
            if (value) {
              setPendingUnlink(false)
              setPendingLink(value)
            }
          }}
          placeholder={t('shared.combobox.placeholder')}
          searchPlaceholder={t('shared.combobox.searchPlaceholder')}
          noResultsText={t('shared.combobox.noResults')}
        />
      )}
    </section>
  )
}
