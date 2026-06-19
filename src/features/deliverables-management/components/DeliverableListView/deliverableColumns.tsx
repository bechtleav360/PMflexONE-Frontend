import { Eye, Pencil, Trash2 } from 'lucide-react'
import type { useTranslation } from 'react-i18next'

import { Badge, Button, type TableColumn } from '@/shared/components'

import type { Deliverable } from '../../types/deliverable.types'

/**
 * Builds the column definitions for the deliverable table.
 *
 * Extracted to a separate module so the definition is not recreated inside the
 * component function on every render (column definitions are stable for a given
 * `canWrite` value).
 *
 * @param t - Translation function from `useTranslation`.
 * @param locale - BCP 47 locale string from `i18n.language` for date formatting.
 * @param canWrite - Whether write-only columns (edit, delete) are included.
 * @param openReadModal - Opens the detail modal for a deliverable.
 * @param openEditModal - Opens the edit modal for a deliverable.
 * @param openDeleteDialog - Opens the delete confirmation dialog.
 * @returns An array of `TableColumn` definitions.
 */
// eslint-disable-next-line max-lines-per-function -- each column definition requires its own render fn + action handlers; splitting across files would make the column set hard to read at a glance
export function createColumns(
  t: ReturnType<typeof useTranslation>['t'],
  locale: string,
  canWrite: boolean,
  openReadModal: (id: string) => void,
  openEditModal: (id: string) => void,
  openDeleteDialog: (id: string, version: number) => void,
): TableColumn<Deliverable>[] {
  return [
    {
      id: 'businessId',
      header: t('features.deliverablesManagement.columns.businessId'),
      sortable: true,
      sortKey: 'businessId',
      cell: (row) =>
        row.businessId ? (
          <Badge
            variant="secondary"
            className="font-mono text-xs"
          >
            {row.businessId}
          </Badge>
        ) : null,
      width: 120,
    },
    {
      id: 'name',
      header: t('features.deliverablesManagement.columns.name'),
      sortable: true,
      sortKey: 'name',
      cell: (row) => (
        <button
          type="button"
          className="hover:text-primary text-left underline-offset-2 hover:underline"
          onClick={() => openReadModal(row.id)}
        >
          {row.name}
        </button>
      ),
    },
    {
      id: 'parent',
      header: t('features.deliverablesManagement.columns.parent'),
      cell: (row) => row.parent?.node.name ?? '—',
      width: 200,
    },
    {
      id: 'owner',
      header: t('features.deliverablesManagement.columns.owner'),
      cell: (row) => {
        if (!row.owner) return '—'
        const { firstName, lastName, userId } = row.owner.node
        const name = `${firstName} ${lastName}`.trim()
        const isActive = !!userId
        return (
          <span className="flex items-center gap-1">
            <span>{name}</span>
            {!isActive && (
              <Badge
                variant="warning"
                className="text-xs"
              >
                {t('features.deliverablesManagement.accessibility.inactiveOwnerSuffix')}
              </Badge>
            )}
          </span>
        )
      },
      width: 160,
    },
    {
      id: 'createdAt',
      header: t('features.deliverablesManagement.columns.createdAt'),
      sortable: true,
      sortKey: 'createdAt',
      cell: (row) => new Date(row.createdAt).toLocaleDateString(locale),
      width: 120,
    },
    {
      id: 'actions',
      header: '',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('features.deliverablesManagement.actions.view')}
            onClick={() => openReadModal(row.id)}
          >
            <Eye className="size-4" />
          </Button>
          {canWrite && (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('features.deliverablesManagement.actions.edit')}
                onClick={() => openEditModal(row.id)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('features.deliverablesManagement.actions.delete')}
                onClick={() => openDeleteDialog(row.id, row.version)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </>
          )}
        </div>
      ),
      width: canWrite ? 120 : 48,
      align: 'right',
    },
  ]
}
