import { useMemo } from 'react'

import type { TFunction } from 'i18next'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { RoleGroup } from '@/entities/role'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ListView,
} from '@/shared/components'
import type { TableColumn } from '@/shared/components'
import { groupHeaderStyle } from '@/shared/lib/groupColor'

interface RoleGroupsTableProps {
  /** Role groups to display. Undefined while loading. */
  roleGroups: RoleGroup[] | undefined
  /** Whether data is still loading. */
  isLoading: boolean
  /** Called with the group ID when the edit button is clicked. */
  onEdit: (id: string) => void
  /** Called with the group ID when the delete button is clicked. */
  onDelete: (id: string) => void
}

// Builds TableColumn definitions for RoleGroup rows; kept outside the component so useMemo deps stay stable.
function buildColumns(
  t: TFunction,
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
): TableColumn<RoleGroup>[] {
  return [
    {
      id: 'name',
      header: t('pages.roleManagement.groupNameLabel'),
      cell: (group) => <span className="font-medium">{group.name}</span>,
    },
    {
      id: 'description',
      header: t('pages.roleManagement.groupDescriptionLabel'),
      cell: (group) => (
        <span className="text-muted-foreground">
          {/* eslint-disable-next-line react/jsx-no-literals -- em-dash is a typographic null indicator, not translatable content */}
          {group.description ?? <span className="italic opacity-50">—</span>}
        </span>
      ),
    },
    {
      id: 'color',
      header: t('pages.roleManagement.groupColorLabel'),
      align: 'center',
      cell: (group) =>
        group.color ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={groupHeaderStyle(group.color)}
          >
            {group.color}
          </span>
        ) : (
          // eslint-disable-next-line react/jsx-no-literals -- em-dash is a typographic null indicator, not translatable content
          <span className="text-xs italic opacity-40">—</span>
        ),
    },
    {
      id: 'sortOrder',
      header: t('pages.roleManagement.groupSortOrderLabel'),
      align: 'center',
      cell: (group) => (
        <span className="bg-primary/10 text-primary inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
          {group.sortOrder}
        </span>
      ),
    },
    {
      id: 'actions',
      header: <span className="sr-only">{t('pages.roleManagement.actionsColumnLabel')}</span>,
      width: 52,
      cell: (group) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={t('pages.roleManagement.groupRowActionsLabel', { name: group.name })}
            >
              <MoreVertical
                className="size-4"
                aria-hidden="true"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(group.id)}>
              <Pencil
                className="mr-2 size-4"
                aria-hidden="true"
              />
              {t('pages.roleManagement.editGroup')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onDelete(group.id)}>
              <Trash2
                className="mr-2 size-4"
                aria-hidden="true"
              />
              {t('pages.roleManagement.deleteGroup')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}

/**
 * Renders role groups in a sortable ListView with edit and delete actions.
 *
 * @param props - Component props.
 * @param props.roleGroups - Role groups to display; undefined while loading.
 * @param props.isLoading - Whether data is still loading.
 * @param props.onEdit - Called with the group ID when the edit action is selected.
 * @param props.onDelete - Called with the group ID when the delete action is selected.
 * @returns The role groups list view.
 */
export function RoleGroupsTable({ roleGroups, isLoading, onEdit, onDelete }: RoleGroupsTableProps) {
  const { t } = useTranslation()
  const columns = useMemo(() => buildColumns(t, onEdit, onDelete), [t, onEdit, onDelete])

  return (
    <ListView
      columns={columns}
      rows={roleGroups ?? []}
      getRowKey={(row) => row.id}
      loading={isLoading}
      emptyTitle={t('pages.roleManagement.noGroups')}
    />
  )
}
