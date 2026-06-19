import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { PermissionKey, TaskResource } from '@/entities/role'
import { ResourcesTable } from '@/entities/role'
import { Label, RadioGroupItem } from '@/shared/components'

interface PermissionOptionRowProps {
  /** The permission key value (R, A, S, C, I, or —). */
  permKey: PermissionKey
  /** Id prefix for the radio input, used for label association. */
  idPrefix: string
  /** Resources available for this key, shown in the expanded panel. */
  resources: TaskResource[]
  /** Whether the expanded panel is currently open. */
  isExpanded: boolean
  /** Called when the user clicks the expand/collapse toggle button. */
  onToggleExpand: (key: PermissionKey) => void
}

/**
 * A single permission option row in the RASCI cell edit dialog.
 * Shows a radio button, the key label and legend text, and an optional
 * expand/collapse button when resources are available for this key.
 *
 * @param props - Row configuration.
 * @returns The rendered permission option row.
 */
export function PermissionOptionRow({
  permKey,
  idPrefix,
  resources,
  isExpanded,
  onToggleExpand,
}: PermissionOptionRowProps) {
  const { t } = useTranslation()
  const hasResources = resources.length > 0

  return (
    <div className="rounded border border-transparent">
      <div className="hover:bg-muted/50 flex items-center gap-3 rounded px-2 py-1.5">
        <RadioGroupItem
          value={permKey}
          id={`${idPrefix}-${permKey}`}
          aria-label={permKey}
        />
        <Label
          htmlFor={`${idPrefix}-${permKey}`}
          className="flex flex-1 cursor-pointer items-center gap-2"
        >
          <span className="w-4 text-center font-mono font-semibold">{permKey}</span>
          <span className="text-muted-foreground text-xs">
            {t(`pages.roleManagement.rasciLegend.${permKey}`)}
          </span>
        </Label>
        {hasResources && (
          <button
            type="button"
            onClick={() => {
              onToggleExpand(permKey)
            }}
            aria-label={
              isExpanded
                ? t('pages.rasciMatrix.collapseResources', 'Collapse')
                : t('pages.rasciMatrix.expandResources', 'Expand')
            }
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring ml-auto flex-shrink-0 rounded p-0.5 focus-visible:ring-2 focus-visible:outline-none"
          >
            {isExpanded ? (
              <ChevronUp
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
            ) : (
              <ChevronDown
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
            )}
          </button>
        )}
      </div>

      {hasResources && isExpanded && (
        <ResourcesTable
          resources={resources}
          permKey={permKey}
        />
      )}
    </div>
  )
}
