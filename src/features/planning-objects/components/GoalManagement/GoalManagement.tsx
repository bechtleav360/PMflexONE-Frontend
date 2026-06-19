import { useState } from 'react'

import { arrayMove } from '@dnd-kit/sortable'
import { Plus, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, Input, showError } from '@/shared/components'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'

import { useDeleteGoal } from '../../hooks/useDeleteGoal'
import { useGoalManagementState } from '../../hooks/useGoalManagementState'
import { useGoals } from '../../hooks/useGoals'
import { useReorderGoals } from '../../hooks/useReorderGoals'
import { useCreateGoalDialogStore } from '../../store/useCreateGoalDialogStore'
import { useEditGoalDialogStore } from '../../store/useEditGoalDialogStore'
import type { PlanningObjectScopeType } from '../../types/shared.types'
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog'
import { CreateGoalDialog } from '../CreateGoalDialog'
import { DeleteWithChildrenDialog } from '../DeleteWithChildrenDialog'
import { EditGoalDialog } from '../EditGoalDialog'
import { GoalTree } from '../GoalTree'

/** Props for {@link GoalManagement}. */
interface GoalManagementProps {
  /** Scope context for the goals. */
  scopeType: PlanningObjectScopeType
  /** ID of the scoped entity. */
  scopeId: string
  /** Optional parent program ID for the "Applies to" combobox. */
  programId?: string | null
  /** Optional parent portfolio ID for the "Applies to" combobox. */
  portfolioId?: string | null
  /**
   * Whether to render the "Applies to" section in the edit dialog.
   * Typically `true` for project-scoped goals, `false` for program/portfolio.
   */
  showAppliesTo?: boolean
}

/** Pending delete state shape used by the delete-with-children dialog. */
interface PendingDelete {
  id: string
  version: number
  childCount: number
}

/**
 * Full goal management view: search, tree, and create/edit/delete dialogs.
 *
 * Renders the goal list as a tree with an add button and search input.
 * Goals with children trigger a confirmation dialog before deletion.
 *
 * @param props - Component props.
 * @param props.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param props.scopeId - The ID of the scoped entity.
 * @param props.programId - Optional parent program ID for the "Applies to" combobox.
 * @param props.portfolioId - Optional parent portfolio ID for the "Applies to" combobox.
 * @param props.showAppliesTo - Whether to show the "Applies to" section in the edit dialog.
 * @returns The rendered goal management panel.
 */
// eslint-disable-next-line max-lines-per-function, complexity -- management component; line count driven by CRUD handler definitions and JSX structure
export function GoalManagement({
  scopeType,
  scopeId,
  programId = null,
  portfolioId = null,
  showAppliesTo = false,
}: GoalManagementProps) {
  const { t } = useTranslation()
  const { data: goals, isLoading, isError } = useGoals(scopeType, scopeId)
  const { tree, searchQuery, setSearchQuery } = useGoalManagementState(goals ?? [])
  const { mutateAsync: deleteGoal, isPending: isDeleting } = useDeleteGoal(scopeType, scopeId)
  const { mutateAsync: reorderGoals } = useReorderGoals(scopeType, scopeId)

  const openCreateDialog = useCreateGoalDialogStore((s) => s.open)
  const openEditDialog = useEditGoalDialogStore((s) => s.open)

  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)

  function handleView(id: string) {
    openEditDialog(id, 'view')
  }

  function handleEdit(id: string) {
    openEditDialog(id, 'edit')
  }

  function handleAddChild(id: string) {
    openCreateDialog(id)
  }

  function handleAddSibling(id: string) {
    const goal = goals?.find((g) => g.id === id)
    openCreateDialog(goal?.parent?.id ?? null)
  }

  function handleDelete(id: string) {
    const goal = goals?.find((g) => g.id === id)
    if (!goal) return
    const childCount = goals?.filter((g) => g.parent?.id === id).length ?? 0
    setPendingDelete({ id, version: goal.version, childCount })
  }

  function handleDeleteLeafConfirm() {
    if (!pendingDelete) return
    void deleteGoalById({ ...pendingDelete, cascade: false }).then(() => {
      setPendingDelete(null)
    })
  }

  async function deleteGoalById({
    id,
    version,
    cascade,
  }: {
    id: string
    version: number
    cascade: boolean
  }) {
    try {
      await deleteGoal({ id, version, cascade })
    } catch (error) {
      showError(
        getGraphQLErrorMessage(error, t('features.planningObjects.goals.toast.deleteError')),
      )
    }
  }

  function handleDeleteCascadeConfirm(cascade: boolean) {
    if (!pendingDelete) return
    void deleteGoalById({ ...pendingDelete, cascade }).then(() => {
      setPendingDelete(null)
    })
  }

  function handleDeleteCancel() {
    setPendingDelete(null)
  }

  function handleDragEnd(activeId: string, overId: string | null) {
    if (!overId || !goals) return
    const oldIndex = goals.findIndex((g) => g.id === activeId)
    const newIndex = goals.findIndex((g) => g.id === overId)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(goals, oldIndex, newIndex)
    void reorderGoals(reordered.map((g) => g.id))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search
            className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            className="pl-8"
            placeholder={t('features.planningObjects.goals.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t('features.planningObjects.goals.searchPlaceholder')}
          />
        </div>
        <Button onClick={() => openCreateDialog()}>
          <Plus
            className="mr-1.5 h-4 w-4"
            aria-hidden="true"
          />
          {t('features.planningObjects.goals.addGoal')}
        </Button>
      </div>

      <GoalTree
        nodes={tree}
        isLoading={isLoading}
        isError={isError}
        onView={handleView}
        onEdit={handleEdit}
        onAddChild={handleAddChild}
        onAddSibling={handleAddSibling}
        onDelete={handleDelete}
        onDragEnd={handleDragEnd}
      />

      <CreateGoalDialog
        scopeType={scopeType}
        scopeId={scopeId}
      />
      <EditGoalDialog
        scopeType={scopeType}
        scopeId={scopeId}
        programId={programId}
        portfolioId={portfolioId}
        showAppliesTo={showAppliesTo}
      />

      <ConfirmDeleteDialog
        open={pendingDelete !== null && (pendingDelete?.childCount ?? 0) === 0}
        isPending={isDeleting}
        onConfirm={handleDeleteLeafConfirm}
        onCancel={handleDeleteCancel}
      />

      <DeleteWithChildrenDialog
        isOpen={pendingDelete !== null && (pendingDelete?.childCount ?? 0) > 0}
        isPending={isDeleting}
        childCount={pendingDelete?.childCount}
        onConfirm={handleDeleteCascadeConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  )
}
