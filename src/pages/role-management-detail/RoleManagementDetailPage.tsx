import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Skeleton } from '@/shared/components'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'

import { BulkSelectionToolbar } from './BulkSelectionToolbar'
import { PageToolbar } from './PageToolbar'
import { RoleManagementDialogs } from './RoleManagementDialogs'
import { RoleManagementMatrix } from './RoleManagementMatrix'
import { useRoleManagementDetailPage } from './useRoleManagementDetailPage'

/**
 * Detail page for a single RASCI template matrix.
 * Displays the full role × task grid with inline cell editing, bulk selection,
 * and CRUD dialogs for roles. Route param: `:matrixId`.
 *
 * @returns The rendered role management detail page.
 */
export function RoleManagementDetailPage() {
  const { t } = useTranslation()
  const page = useRoleManagementDetailPage()

  if (page.isLoading) {
    return (
      <PageContent className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </PageContent>
    )
  }

  if (!page.matrixDetail || !page.matrixId) {
    return (
      <PageContent>
        <p className="text-muted-foreground text-sm">
          {t('pages.roleManagement.matrixNotFound', 'Matrix not found.')}
        </p>
      </PageContent>
    )
  }

  const domainLabel = t(
    `pages.roleManagement.domainType.${page.matrixDetail.domainType}`,
    page.matrixDetail.domainType,
  )

  return (
    <PageContent className="space-y-6">
      <div className="mb-2 flex items-center gap-2">
        <Link
          to="/admin/role-management"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          {t('nav.roleManagement', 'Role Management')}
        </Link>
        <span
          className="text-muted-foreground"
          aria-hidden="true"
        >
          {CRUMB_SEP}
        </span>
        <span className="text-sm font-medium">{domainLabel}</span>
      </div>
      <h1 className="text-3xl font-bold tracking-tight">{domainLabel}</h1>

      <PageToolbar
        isReadOnly={page.isReadOnly}
        isBulkMode={page.isBulkMode}
        onToggleBulkMode={page.toggleBulkMode}
        onAddRole={page.openAddRole}
      />

      <RoleManagementMatrix
        roles={page.roles}
        tasks={page.tasks}
        orderedGroupIds={page.orderedGroupIds}
        roleGroupMap={page.roleGroupMap}
        orderedTaskGroupIds={page.orderedTaskGroupIds}
        taskGroupMap={page.taskGroupMap}
        tasksByGroup={page.tasksByGroup}
        ungroupedTasks={page.ungroupedTasks}
        bulkSelectedCells={page.bulkSelectedCells}
        isReadOnly={page.isReadOnly}
        onCellClick={page.handleCellClick}
        onBulkEditForTaskGroup={page.openBulkEditForTaskGroup}
        onEditRole={page.openEditRole}
        onDeleteRole={page.openDeleteRole}
      />

      <RoleManagementDialogs
        matrixId={page.matrixId}
        roles={page.roles}
        tasks={page.tasks}
        isAddRoleOpen={page.isAddRoleOpen}
        isEditRoleOpen={page.isEditRoleOpen}
        isDeleteRoleOpen={page.isDeleteRoleOpen}
        selectedRole={page.selectedRole}
        selectedRoleId={page.selectedRoleId}
        selectedTaskName={page.selectedTask?.name ?? null}
        selectedCell={page.selectedCell}
      />

      {page.bulkCount > 0 && !page.isBulkEditOpen && (
        <BulkSelectionToolbar
          count={page.bulkCount}
          onEdit={page.openBulkEdit}
          onClear={page.clearBulkSelection}
        />
      )}
    </PageContent>
  )
}
