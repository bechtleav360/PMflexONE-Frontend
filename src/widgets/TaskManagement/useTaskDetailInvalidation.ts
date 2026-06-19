import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { BOARD_CACHE_PREFIX, WORK_ITEMS_QUERY_KEY } from '@/entities/work-item'
import type { WorkItem } from '@/entities/work-item'
import { useDeleteProjectWorkItem } from '@/features/work-item-crud'
import type { ScopeType } from '@/shared/types/scopeType'

interface UseTaskDetailInvalidationProps {
  scopeType: ScopeType
  scopeId: string
  onClose: () => void
}

/**
 * Encapsulates optimistic cache removal and query invalidation for work-item deletion.
 * @param root0 - Hook props.
 * @param root0.scopeType - Entity type owning the work item.
 * @param root0.scopeId - ID of the owning entity.
 * @param root0.onClose - Called after deletion to dismiss the panel.
 * @returns `handleDeleteConfirmed` handler and `isDeleting` pending flag.
 */
export function useTaskDetailInvalidation({
  scopeType,
  scopeId,
  onClose,
}: UseTaskDetailInvalidationProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { mutateAsync: deleteWorkItem, isPending: isDeleting } = useDeleteProjectWorkItem()

  async function handleDeleteConfirmed(workItem: WorkItem) {
    const { id, name } = workItem
    queryClient.setQueriesData<WorkItem[]>(
      { queryKey: WORK_ITEMS_QUERY_KEY(scopeType, scopeId) },
      (old) => old?.filter((item) => item.id !== id) ?? [],
    )
    queryClient.setQueriesData<{ columns: Array<{ workItems: WorkItem[] }> }>(
      { queryKey: BOARD_CACHE_PREFIX },
      (old) =>
        old
          ? {
              ...old,
              columns: old.columns.map((col) => ({
                ...col,
                workItems: col.workItems.filter((wi) => wi.id !== id),
              })),
            }
          : old,
    )
    onClose()
    try {
      await deleteWorkItem(id)
      toast.success(
        t('pages.taskManagement.deleteSuccess', {
          name,
          defaultValue: `Task "{{name}}" was deleted.`,
        }),
      )
    } catch {
      toast.error(t('pages.taskManagement.deleteError', 'Failed to delete task.'))
    } finally {
      void queryClient.invalidateQueries({ queryKey: WORK_ITEMS_QUERY_KEY(scopeType, scopeId) })
      void queryClient.invalidateQueries({ queryKey: BOARD_CACHE_PREFIX })
    }
  }

  return { handleDeleteConfirmed, isDeleting }
}
