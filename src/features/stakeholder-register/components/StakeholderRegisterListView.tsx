import { useMemo } from 'react'

import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { StakeholderEntry } from '@/entities/stakeholder'
import { Button, ListView } from '@/shared/components'
import type { TableColumn } from '@/shared/components'

/** Props for {@link StakeholderRegisterListView}. */
export interface StakeholderRegisterListViewProps {
  entries: StakeholderEntry[]
  canWrite?: boolean
  onEdit: (entry: StakeholderEntry) => void
  onDelete: (entry: StakeholderEntry) => void
}

/**
 * Data table for stakeholder entries with edit and delete action buttons.
 *
 * Renders all entries in a shared `ListView` component. Edit and delete buttons
 * are always visible (authorisation is enforced server-side).
 *
 * @param props - Component props.
 * @param props.entries - The stakeholder entries to display.
 * @param props.canWrite - When false, hides the action column. Defaults to true; authorisation is enforced server-side.
 * @param props.onEdit - Callback invoked when the user clicks the edit button for an entry.
 * @param props.onDelete - Callback invoked when the user clicks the delete button for an entry.
 * @returns A list view with one row per stakeholder entry plus action controls.
 */
export function StakeholderRegisterListView({
  entries,
  canWrite = true,
  onEdit,
  onDelete,
}: StakeholderRegisterListViewProps) {
  const { t } = useTranslation()

  const columns = useMemo<TableColumn<StakeholderEntry>[]>(
    () => [
      {
        id: 'name',
        header: t('pages.stakeholderRegister.table.nameColumn'),
        cell: (row) => row.name,
        sortable: true,
        minWidth: 150,
      },
      {
        id: 'role',
        header: t('pages.stakeholderRegister.table.roleColumn'),
        cell: (row) => row.role,
        sortable: true,
        minWidth: 130,
        truncate: true,
      },
      {
        id: 'contactGroup',
        header: t('pages.stakeholderRegister.table.contactGroupColumn'),
        cell: (row) => t(`pages.stakeholderRegister.form.contactGroupOptions.${row.contactGroup}`),
        minWidth: 130,
      },
      {
        id: 'typeOfAffectedness',
        header: t('pages.stakeholderRegister.table.typeOfAffectednessColumn'),
        cell: (row) =>
          row.typeOfAffectedness
            ? t(
                `pages.stakeholderRegister.form.typeOfAffectednessOptions.${row.typeOfAffectedness}`,
              )
            : '—',
        minWidth: 160,
      },
      {
        id: 'conflictPotential',
        header: t('pages.stakeholderRegister.table.conflictPotentialColumn'),
        cell: (row) =>
          row.conflictPotential
            ? t(`pages.stakeholderRegister.form.conflictPotentialOptions.${row.conflictPotential}`)
            : '—',
        minWidth: 150,
      },
      ...(canWrite
        ? [
            {
              id: 'actions',
              header: '',
              cell: (row: StakeholderEntry) => (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('pages.stakeholderRegister.table.editButton')}
                    onClick={() => onEdit(row)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('pages.stakeholderRegister.table.deleteButton')}
                    onClick={() => onDelete(row)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ),
              minWidth: 80,
            },
          ]
        : []),
    ],
    [t, canWrite, onEdit, onDelete],
  )

  return (
    <ListView<StakeholderEntry>
      columns={columns}
      rows={entries}
      getRowKey={(row) => row.id}
      emptyTitle={t('pages.stakeholderRegister.emptyState')}
      emptyDescription=""
      stickyHeader
      containerClassName="overflow-auto"
      enableColumnReordering
    />
  )
}
