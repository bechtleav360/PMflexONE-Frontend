import { useCallback, useMemo, useState } from 'react'

import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { useGetProject } from '@/entities/project'
import {
  DeletePlanningRoleDialog,
  PlanningRoleFormDialog,
  usePlanningRoles,
  useSupportServiceTree,
  type PlanningRole,
  type SupportService,
} from '@/features/support-services-management'
import {
  Button,
  ButtonIcon,
  ListView,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  type TableColumn,
  type TableSortState,
} from '@/shared/components'
import { showSuccess } from '@/shared/components/Toast/toastApi'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'

interface DeleteState {
  open: boolean
  id: string | null
  name: string
  version: number | null
  assignedCount: number
}

const CLOSED_DELETE: DeleteState = {
  open: false,
  id: null,
  name: '',
  version: null,
  assignedCount: 0,
}

/**
 * Builds the column definitions for the planning roles table.
 *
 * @param t - Translation function.
 * @param onEdit - Opens the form dialog for editing a role.
 * @param onDelete - Opens the delete confirmation dialog.
 * @param treeData - Flat support services list, used to count role assignments.
 * @returns An array of `TableColumn` definitions.
 */
// eslint-disable-next-line max-lines-per-function -- column definitions; each column cell requires inline JSX
function createColumns(
  t: ReturnType<typeof useTranslation>['t'],
  onEdit: (id: string) => void,
  onDelete: (id: string, name: string, version: number, assignedCount: number) => void,
  treeData: { flat: SupportService[] } | undefined,
): TableColumn<PlanningRole>[] {
  return [
    {
      id: 'name',
      header: t('features.planningRolesManagement.columns.name'),
      sortable: true,
      sortKey: 'name',
      cell: (row) => (
        <button
          type="button"
          className="hover:text-primary text-left underline-offset-2 hover:underline"
          onClick={() => onEdit(row.id)}
        >
          {row.name}
        </button>
      ),
    },
    {
      id: 'capacityPerWeek',
      header: t('features.planningRolesManagement.columns.capacityPerWeek'),
      sortable: true,
      sortKey: 'capacityPerWeek',
      cell: (row) => `${row.capacityPerWeek} ${t('common.unitPt')}`,
      width: 160,
    },
    {
      id: 'assigned',
      header: t('features.planningRolesManagement.columns.assigned'),
      cell: (row) => `${row.assigned.toFixed(2)} ${t('common.unitPt')}`,
      width: 140,
    },
    {
      id: 'unassigned',
      header: t('features.planningRolesManagement.columns.unassigned'),
      cell: (row) => (
        <span className={row.unassigned < 0 ? 'text-destructive' : ''}>
          {row.unassigned.toFixed(2)} {t('common.unitPt')}
        </span>
      ),
      width: 155,
    },
    {
      id: 'users',
      header: t('features.planningRolesManagement.columns.users'),
      cell: (row) => row.userAssignments.length,
      width: 120,
    },
    {
      id: 'actions',
      header: '',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('features.planningRolesManagement.actions.edit')}
                onClick={() => onEdit(row.id)}
              >
                <Pencil
                  className="size-4"
                  aria-hidden="true"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('features.planningRolesManagement.actions.edit')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('features.planningRolesManagement.actions.delete')}
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  const flat = treeData?.flat ?? []
                  const serviceCount = flat.filter((s) => s.assignee?.node.id === row.id).length
                  onDelete(row.id, row.name, row.version, serviceCount)
                }}
              >
                <Trash2
                  className="size-4"
                  aria-hidden="true"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('features.planningRolesManagement.actions.delete')}</TooltipContent>
          </Tooltip>
        </div>
      ),
      width: 96,
      align: 'right',
    },
  ]
}

/**
 * Project-scoped planning roles management page.
 *
 * Shows a table of all planning roles for a project with create, edit, and delete actions.
 * Create/edit uses `PlanningRoleFormDialog`; delete uses `DeletePlanningRoleDialog`.
 *
 * @returns The rendered planning roles page.
 */
// eslint-disable-next-line max-lines-per-function -- page-level orchestration: sort state, delete state, and data fetching all reference the same local variables
export function ProjectPlanningRolesPage() {
  const { t } = useTranslation()
  const { id: projectId = '' } = useParams<{ id: string }>()
  const { data: project } = useGetProject(projectId)

  const [formOpen, setFormOpen] = useState(false)
  const [editRoleId, setEditRoleId] = useState<string | null>(null)
  const [deleteState, setDeleteState] = useState<DeleteState>(CLOSED_DELETE)

  const { data: roles = [], isPending, isError } = usePlanningRoles(projectId)
  const { data: treeData } = useSupportServiceTree(projectId)

  const [sort, setSort] = useState<TableSortState | null>(null)

  const sortedRoles = useMemo(() => {
    if (!sort) return roles
    const dir = sort.direction === 'asc' ? 1 : -1
    const field = sort.field
    return [...roles].sort((a, b) => {
      if (!(field in a) || !(field in b)) return 0
      const av = String((a as Record<string, unknown>)[field] ?? '')
      const bv = String((b as Record<string, unknown>)[field] ?? '')
      return av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' }) * dir
    })
  }, [roles, sort])

  function openCreate() {
    setEditRoleId(null)
    setFormOpen(true)
  }

  const openEdit = useCallback((id: string) => {
    setEditRoleId(id)
    setFormOpen(true)
  }, [])

  const openDelete = useCallback(
    (id: string, name: string, version: number, assignedCount: number) => {
      setDeleteState({ open: true, id, name, version, assignedCount })
    },
    [],
  )

  const columns = useMemo(
    () => createColumns(t, openEdit, openDelete, treeData),
    [t, openEdit, openDelete, treeData],
  )

  return (
    <PageContent variant="scrollable">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <Link
          to="/projects"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          {t('pages.projects.title')}
        </Link>
        <span
          className="text-muted-foreground"
          aria-hidden="true"
        >
          {CRUMB_SEP}
        </span>
        <Link
          to={`/projects/${projectId}`}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          {project?.name ?? projectId}
        </Link>
        <span
          className="text-muted-foreground"
          aria-hidden="true"
        >
          {CRUMB_SEP}
        </span>
        <span className="text-sm font-medium">
          {t('features.planningRolesManagement.pageTitle')}
        </span>
      </div>

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {t('features.planningRolesManagement.pageTitle')}
        </h1>
        <Button
          size="sm"
          onClick={openCreate}
        >
          <ButtonIcon icon={Plus} />
          {t('features.planningRolesManagement.actions.create')}
        </Button>
      </div>

      {/* Notice */}
      <p className="text-muted-foreground mb-4 text-sm">
        {t('features.planningRolesManagement.headerNotice')}
      </p>

      {/* Error state */}
      {isError && (
        <p className="text-destructive mb-4 text-sm">
          {t('features.planningRolesManagement.error.loadFailed')}
        </p>
      )}

      {/* Table */}
      <ListView
        columns={columns}
        rows={sortedRoles}
        getRowKey={(row) => row.id}
        sort={sort}
        onSortChange={setSort}
        loading={isPending}
        emptyTitle={t('features.planningRolesManagement.empty.title')}
      />

      {/* Form dialog (always mounted) */}
      <PlanningRoleFormDialog
        projectId={projectId}
        planningRoleId={editRoleId}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={() => {
          showSuccess(
            editRoleId
              ? t('features.planningRolesManagement.toast.saved')
              : t('features.planningRolesManagement.toast.created'),
          )
          setFormOpen(false)
        }}
      />

      {/* Delete dialog (always mounted) */}
      <DeletePlanningRoleDialog
        projectId={projectId}
        open={deleteState.open}
        planningRoleId={deleteState.id}
        planningRoleName={deleteState.name}
        version={deleteState.version}
        assignedCount={deleteState.assignedCount}
        onClose={() => setDeleteState(CLOSED_DELETE)}
        onDeleted={() => {
          setDeleteState(CLOSED_DELETE)
          showSuccess(t('features.planningRolesManagement.toast.deleted'))
        }}
      />
    </PageContent>
  )
}
