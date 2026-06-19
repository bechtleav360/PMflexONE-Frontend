import { useState } from 'react'

import { arrayMove } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, showError } from '@/shared/components'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'

import { useDeleteRequirement } from '../../hooks/useDeleteRequirement'
import { useReorderRequirements } from '../../hooks/useReorderRequirements'
import { useRequirementManagementState } from '../../hooks/useRequirementManagementState'
import { useRequirements } from '../../hooks/useRequirements'
import { useCreateRequirementDialogStore } from '../../store/useCreateRequirementDialogStore'
import { useEditRequirementDialogStore } from '../../store/useEditRequirementDialogStore'
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog'
import { CreateRequirementDialog } from '../CreateRequirementDialog'
import { DeleteWithChildrenDialog } from '../DeleteWithChildrenDialog'
import { EditRequirementDialog } from '../EditRequirementDialog'
import { RequirementTree } from '../RequirementTree'

/** Props for {@link RequirementManagement}. */
interface RequirementManagementProps {
  /** ID of the project scope. */
  scopeId: string
}

/** Pending delete state shape used by the delete-with-children dialog. */
interface PendingDelete {
  id: string
  version: number
  childCount: number
}

function getActiveTabId(filter: 'ALL' | 'IN_SCOPE' | 'OUT_OF_SCOPE'): string {
  if (filter === 'IN_SCOPE') return 'req-tab-in-scope'
  if (filter === 'OUT_OF_SCOPE') return 'req-tab-out-of-scope'
  return 'req-tab-all'
}

/**
 * Full requirement management view: scope filter tabs, tree, and create/edit/delete dialogs.
 *
 * @param props - Component props.
 * @param props.scopeId - The ID of the project scope.
 * @returns The rendered requirement management panel.
 */
// eslint-disable-next-line max-lines-per-function -- management component; line count driven by CRUD handler definitions and JSX structure
export function RequirementManagement({ scopeId }: RequirementManagementProps) {
  const { t } = useTranslation()
  const { data: requirements, isLoading, isError } = useRequirements('Project', scopeId)
  const { tree, filter, setFilter, totalCount, inScopeCount, outOfScopeCount } =
    useRequirementManagementState(requirements ?? [])
  const { mutateAsync: deleteRequirement, isPending: isDeleting } = useDeleteRequirement(
    'Project',
    scopeId,
  )
  const { mutateAsync: reorderRequirements } = useReorderRequirements('Project', scopeId)

  const openCreateDialog = useCreateRequirementDialogStore((s) => s.open)
  const openEditDialog = useEditRequirementDialogStore((s) => s.open)

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
    const req = requirements?.find((r) => r.id === id)
    openCreateDialog(req?.parent?.id ?? null)
  }

  function handleDelete(id: string) {
    const req = requirements?.find((r) => r.id === id)
    if (!req) return
    const children = requirements?.filter((r) => r.parent?.id === id) ?? []
    setPendingDelete({ id, version: req.version, childCount: children.length })
  }

  function handleDeleteLeafConfirm() {
    if (!pendingDelete) return
    void deleteById({ ...pendingDelete, cascade: false }).then(() => {
      setPendingDelete(null)
    })
  }

  async function deleteById({
    id,
    version,
    cascade,
  }: {
    id: string
    version: number
    cascade: boolean
  }) {
    try {
      await deleteRequirement({ id, version, cascade })
    } catch (error) {
      showError(
        getGraphQLErrorMessage(error, t('features.planningObjects.requirements.toast.deleteError')),
      )
    }
  }

  function handleDeleteCascadeConfirm(cascade: boolean) {
    if (!pendingDelete) return
    void deleteById({ ...pendingDelete, cascade }).then(() => {
      setPendingDelete(null)
    })
  }

  function handleDeleteCancel() {
    setPendingDelete(null)
  }

  function handleDragEnd(activeId: string, overId: string | null) {
    if (!overId || !requirements) return
    const oldIndex = requirements.findIndex((r) => r.id === activeId)
    const newIndex = requirements.findIndex((r) => r.id === overId)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(requirements, oldIndex, newIndex)
    void reorderRequirements(reordered.map((r) => r.id))
  }

  const tabLabelAll = `${t('features.planningObjects.requirements.filterAll')} (${totalCount})`
  const tabLabelInScope = `${t('features.planningObjects.requirements.filterInScope')} (${inScopeCount})`
  const tabLabelOutOfScope = `${t('features.planningObjects.requirements.filterOutOfScope')} (${outOfScopeCount})`
  const activeTabId = getActiveTabId(filter)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="border-border bg-muted flex items-center gap-1 rounded-lg border p-1"
          role="tablist"
          aria-label={t('features.planningObjects.requirements.filterTabsLabel')}
        >
          <button
            id="req-tab-all"
            role="tab"
            type="button"
            aria-selected={filter === 'ALL'}
            aria-controls="req-tree-panel"
            className="aria-selected:bg-background aria-selected:text-foreground text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded px-3 py-1 text-sm transition-colors outline-none focus-visible:ring-2 aria-selected:shadow-sm"
            onClick={() => setFilter('ALL')}
          >
            {tabLabelAll}
          </button>
          <button
            id="req-tab-in-scope"
            role="tab"
            type="button"
            aria-selected={filter === 'IN_SCOPE'}
            aria-controls="req-tree-panel"
            className="aria-selected:bg-background aria-selected:text-foreground text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded px-3 py-1 text-sm transition-colors outline-none focus-visible:ring-2 aria-selected:shadow-sm"
            onClick={() => setFilter('IN_SCOPE')}
          >
            {tabLabelInScope}
          </button>
          <button
            id="req-tab-out-of-scope"
            role="tab"
            type="button"
            aria-selected={filter === 'OUT_OF_SCOPE'}
            aria-controls="req-tree-panel"
            className="aria-selected:bg-background aria-selected:text-foreground text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded px-3 py-1 text-sm transition-colors outline-none focus-visible:ring-2 aria-selected:shadow-sm"
            onClick={() => setFilter('OUT_OF_SCOPE')}
          >
            {tabLabelOutOfScope}
          </button>
        </div>

        <Button onClick={() => openCreateDialog()}>
          <Plus
            className="mr-1.5 h-4 w-4"
            aria-hidden="true"
          />
          {t('features.planningObjects.requirements.addRequirement')}
        </Button>
      </div>

      <div
        id="req-tree-panel"
        role="tabpanel"
        aria-labelledby={activeTabId}
      >
        <RequirementTree
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
      </div>

      <CreateRequirementDialog
        scopeType="Project"
        scopeId={scopeId}
      />
      <EditRequirementDialog scopeId={scopeId} />

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
