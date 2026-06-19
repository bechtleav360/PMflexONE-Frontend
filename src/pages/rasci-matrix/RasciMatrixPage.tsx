import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { DomainType, MatrixRole, MatrixTask, RoleGroup } from '@/entities/role'
import {
  DeleteObjectRoleDialog,
  EditObjectRoleDialog,
  ObjectRoleDialog,
  OverrideValueDialog,
  RasciMatrix,
  ResetColumnDialog,
} from '@/features/rasci-matrix'
import { Skeleton } from '@/shared/components'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'

import { useRasciMatrixPage } from './useRasciMatrixPage'

type RasciT = ReturnType<typeof useTranslation>['t']

function renderRasciBreadcrumb(
  listPath: string,
  navLabel: string,
  detailPath: string,
  objectName: string | undefined,
  objectId: string,
  t: RasciT,
) {
  return (
    <div className="flex items-center gap-2">
      <Link
        to={listPath}
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        {navLabel}
      </Link>
      <span
        className="text-muted-foreground"
        aria-hidden="true"
      >
        {CRUMB_SEP}
      </span>
      <Link
        to={detailPath}
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        {objectName ?? objectId}
      </Link>
      <span
        className="text-muted-foreground"
        aria-hidden="true"
      >
        {CRUMB_SEP}
      </span>
      <span className="text-sm font-medium">{t('pages.rasciMatrix.title')}</span>
    </div>
  )
}

type RasciDialogProps = {
  isOverrideDialogOpen: boolean
  isResetColumnDialogOpen: boolean
  isObjectRoleDialogOpen: boolean
  isEditObjectRoleDialogOpen: boolean
  isDeleteObjectRoleDialogOpen: boolean
  objectId: string
  domainType: DomainType
  tasks: MatrixTask[]
  templateRoles: MatrixRole[]
  roleGroups: RoleGroup[]
  selectedObjectRole: MatrixRole | undefined
  selectedColumnRoleName: string
}

function renderRasciDialogs(p: RasciDialogProps) {
  return (
    <>
      <OverrideValueDialog
        open={p.isOverrideDialogOpen}
        objectId={p.objectId}
        domainType={p.domainType}
        tasks={p.tasks}
      />
      <ResetColumnDialog
        open={p.isResetColumnDialogOpen}
        objectId={p.objectId}
        domainType={p.domainType}
      />
      <ObjectRoleDialog
        open={p.isObjectRoleDialogOpen}
        templateRoles={p.templateRoles}
        roleGroups={p.roleGroups}
        objectId={p.objectId}
        domainType={p.domainType}
      />
      <EditObjectRoleDialog
        open={p.isEditObjectRoleDialogOpen}
        role={p.selectedObjectRole}
        roleGroups={p.roleGroups}
        objectId={p.objectId}
        domainType={p.domainType}
      />
      <DeleteObjectRoleDialog
        open={p.isDeleteObjectRoleDialogOpen}
        objectId={p.objectId}
        domainType={p.domainType}
        roleName={p.selectedColumnRoleName}
      />
    </>
  )
}

/**
 * Page for displaying the RASCI rights matrix for a specific object (project/program/portfolio).
 * Fetches both the object matrix and the template matrix, resolves overrides, and renders
 * the full `RasciMatrix` component with appropriate dialogs.
 *
 * Route params: `:objectType` and `:objectId`.
 *
 * @returns The rendered RASCI matrix page.
 */
export function RasciMatrixPage() {
  const { t } = useTranslation()
  const {
    objectId,
    objectName,
    domainType,
    objectMatrix,
    templateMatrix,
    roleGroups,
    taskGroups,
    isLoading,
    columns,
    canEdit,
    canAddRole,
    navLabel,
    listPath,
    detailPath,
    isOverrideDialogOpen,
    isResetColumnDialogOpen,
    isObjectRoleDialogOpen,
    isEditObjectRoleDialogOpen,
    isDeleteObjectRoleDialogOpen,
    selectedObjectRole,
    selectedColumnRoleName,
  } = useRasciMatrixPage()

  if (isLoading) {
    return (
      <PageContent
        className="space-y-4"
        aria-busy="true"
        aria-label={t('pages.rasciMatrix.skeletonLabel')}
      >
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </PageContent>
    )
  }

  if (!objectMatrix || !templateMatrix) {
    return (
      <PageContent>
        <p className="text-muted-foreground text-sm">{t('pages.rasciMatrix.noRoles')}</p>
      </PageContent>
    )
  }

  const breadcrumb = renderRasciBreadcrumb(listPath, navLabel, detailPath, objectName, objectId, t)

  if (objectMatrix.roles.length === 0) {
    return (
      <PageContent className="space-y-6">
        {breadcrumb}
        <h1 className="text-3xl font-bold tracking-tight">{t('pages.rasciMatrix.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('pages.rasciMatrix.noRoles')}</p>
      </PageContent>
    )
  }

  const dialogProps: RasciDialogProps = {
    isOverrideDialogOpen,
    isResetColumnDialogOpen,
    isObjectRoleDialogOpen,
    isEditObjectRoleDialogOpen,
    isDeleteObjectRoleDialogOpen,
    objectId,
    domainType,
    tasks: objectMatrix.tasks,
    templateRoles: templateMatrix.roles,
    roleGroups,
    selectedObjectRole,
    selectedColumnRoleName,
  }

  return (
    <PageContent className="space-y-6">
      {breadcrumb}

      <h1 className="text-3xl font-bold tracking-tight">{t('pages.rasciMatrix.title')}</h1>

      <RasciMatrix
        columns={columns}
        tasks={objectMatrix.tasks}
        taskGroups={taskGroups}
        roleGroups={roleGroups}
        objectId={objectId}
        domainType={domainType}
        canEdit={canEdit}
        canAddRole={canAddRole}
      />

      {renderRasciDialogs(dialogProps)}
    </PageContent>
  )
}
