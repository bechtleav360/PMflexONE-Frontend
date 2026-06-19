import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { useGetProject } from '@/entities/project'
import { resolveMatrix, useMatrix, useRoleGroups, useTaskGroups } from '@/entities/role'
import { usePortfolios } from '@/features/portfolios'
import { useProgram } from '@/features/programs'
import { useRasciMatrixStore } from '@/features/rasci-matrix'

import { anyPending, resolveDomainType, resolveNavLabels } from './lib/resolveNavLabels'

/**
 * Resolves a human-readable object name from the object type and ID.
 * Each query is conditionally enabled — only the query matching `objectType` executes.
 *
 * @param objectType - URL segment identifying the object type.
 * @param objectId - The object's unique identifier.
 * @returns The resolved name, or `undefined` while loading.
 */
function useObjectName(objectType: string, objectId: string): string | undefined {
  const { data: project } = useGetProject(objectType === 'projects' ? objectId : null)
  const { data: program } = useProgram(objectType === 'programs' ? objectId : null)
  const { data: portfolios = [] } = usePortfolios({ enabled: objectType === 'portfolios' })

  if (objectType === 'projects') return project?.name
  if (objectType === 'programs') return program?.name
  if (objectType === 'portfolios') return portfolios.find((p) => p.id === objectId)?.name
  return undefined
}

/**
 * Encapsulates all data-fetching, store access, computed values, and navigation labels
 * for `RasciMatrixPage`. Keeps the page component a thin coordinator.
 *
 * @returns All state and derived values needed by the RASCI matrix page.
 */
export function useRasciMatrixPage() {
  const { t } = useTranslation()
  const params = useParams<{ objectType: string; objectId: string }>()
  const objectType = params.objectType ?? ''
  const objectId = params.objectId ?? ''

  const domainType = resolveDomainType(objectType)

  const { data: objectMatrix, isPending: objectMatrixPending } = useMatrix({ domainType, objectId })
  const { data: templateMatrix, isPending: templateMatrixPending } = useMatrix({ domainType })
  const { data: roleGroups = [], isPending: roleGroupsPending } = useRoleGroups()
  const { data: taskGroups = [], isPending: taskGroupsPending } = useTaskGroups()

  const objectName = useObjectName(objectType, objectId)

  const {
    isOverrideDialogOpen,
    isResetColumnDialogOpen,
    isObjectRoleDialogOpen,
    isEditObjectRoleDialogOpen,
    isDeleteObjectRoleDialogOpen,
    selectedColumnRoleId,
  } = useRasciMatrixStore()

  const isLoading = anyPending(
    objectMatrixPending,
    templateMatrixPending,
    roleGroupsPending,
    taskGroupsPending,
  )

  const navKeyMap: Record<string, string> = {
    projects: t('nav.projects', 'Projects'),
    programs: t('nav.programs', 'Programs'),
    portfolios: t('nav.portfolios', 'Portfolios'),
  }

  const { navLabel, listPath, detailPath } = resolveNavLabels(objectType, objectId, navKeyMap)

  // TODO: derive from useUserPermissions once permission resources are defined
  const canEdit = true
  const canAddRole = true

  const columns =
    objectMatrix && templateMatrix ? resolveMatrix(objectMatrix, templateMatrix, roleGroups) : []

  const selectedObjectRole = objectMatrix?.roles.find((r) => r.id === selectedColumnRoleId)
  const selectedColumnRoleName = selectedObjectRole?.name ?? ''

  return {
    objectType,
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
  }
}
