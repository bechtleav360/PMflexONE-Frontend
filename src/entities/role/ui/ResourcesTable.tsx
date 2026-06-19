import { useTranslation } from 'react-i18next'

import type { PermissionKey, TaskResource } from '../model/role.types'

/**
 * Props for the ResourcesTable component.
 * @property resources - Resources to display in the expanded panel.
 * @property permKey - The permission key used to look up operations per resource.
 */
interface ResourcesTableProps {
  resources: TaskResource[]
  permKey: PermissionKey
}

// Raw HTML table intentional — this renders inside a compact expandable panel in a dialog.
// The shared Table component has hardcoded h-12 header height, px-lg padding, and bg-muted
// that cannot be overridden without !important hacks and look wrong at this scale.

/**
 * Compact resources table rendered inside a permission option row expand panel.
 * Lists each resource and the operations it grants for the given permission key.
 *
 * @param props - Component props.
 * @returns The rendered resources table.
 */
export function ResourcesTable({ resources, permKey }: ResourcesTableProps) {
  const { t } = useTranslation()
  return (
    <div className="px-2 pb-2">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-muted/50 rounded">
            <th className="text-muted-foreground px-2 py-1 text-left text-[10px] font-medium tracking-wide uppercase">
              {t('pages.rasciMatrix.resourcesColumnName')}
            </th>
            <th className="text-muted-foreground px-2 py-1 text-left text-[10px] font-medium tracking-wide uppercase">
              {t('pages.rasciMatrix.resourcesColumnOperations')}
            </th>
          </tr>
        </thead>
        <tbody>
          {resources.map((resource) => {
            const opk = resource.operationsByKey.find((o) => o.permissionKey === permKey)
            const ops = opk?.operations ?? []
            const opsLabel = ops.map((op) => t(`pages.rasciMatrix.operations.${op}`, op)).join(', ')
            return (
              <tr key={resource.name}>
                <td className="text-muted-foreground px-2 py-0.5">{resource.name}</td>
                <td className="text-muted-foreground px-2 py-0.5">{opsLabel}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
