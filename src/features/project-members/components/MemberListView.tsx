import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { MemberAssignment } from '@/entities/project-member'
import { Button, ListView } from '@/shared/components'
import type { TableColumn } from '@/shared/components'

import { useProjectMembersStore } from '../store/projectMembersStore'

interface MemberListViewProps {
  assignments: MemberAssignment[]
}

/**
 * Renders the list of member assignments in a table with edit and unassign actions per row.
 *
 * @param root0 - Component props.
 * @returns The rendered member list view element.
 */
export function MemberListView({ assignments }: MemberListViewProps) {
  const { t } = useTranslation()
  const { openEdit, openUnassign } = useProjectMembersStore()

  function getDisplayName(a: MemberAssignment): string {
    const full = [a.person.firstName, a.person.lastName].filter(Boolean).join(' ')
    return full || a.person.mail || '—'
  }

  const columns: TableColumn<MemberAssignment>[] = [
    {
      id: 'name',
      header: t('pages.projectMembers.columnName'),
      cell: (row) => <span>{getDisplayName(row)}</span>,
    },
    {
      id: 'mail',
      header: t('pages.projectMembers.columnMail'),
      cell: (row) => <span className="text-muted-foreground">{row.person.mail ?? '—'}</span>,
    },
    {
      id: 'initials',
      header: t('pages.projectMembers.columnInitials'),
      cell: (row) => <span className="text-muted-foreground">{row.initials ?? '—'}</span>,
    },
    {
      id: 'role',
      header: t('pages.projectMembers.columnRole'),
      cell: (row) => <span>{row.role.name}</span>,
    },
    {
      id: 'actions',
      header: '',
      cellClassName: 'w-24 text-right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('pages.projectMembers.editButton')}
            onClick={() => openEdit(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('pages.projectMembers.unassignButton')}
            onClick={() => openUnassign(row.id, getDisplayName(row))}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <ListView<MemberAssignment>
      cardClassName="overflow-x-auto"
      columns={columns}
      rows={assignments}
      getRowKey={(row) => row.id}
    />
  )
}
