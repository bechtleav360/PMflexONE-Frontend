import { useCallback, useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import type { ProjectWorkItem } from '@/entities/work-item'
import {
  toCreateInput,
  toUpdateInput,
  useCreateProjectWorkItem,
  useUpdateProjectWorkItem,
  type WorkItemFormHandle,
  type WorkItemFormValues,
} from '@/features/work-item-crud'
import { useAddLabelToWorkItem, useRemoveLabelFromWorkItem } from '@/features/work-item-labels'
import type { ScopeType } from '@/shared/types/scopeType'

import {
  BLANK_FORM,
  editFormSchema,
  type DetailPanelMode,
  type EditFormValues,
} from './taskDetailPanelTypes'

type LabelMutator = (args: { workItemId: string; labelId: string }) => Promise<unknown>

async function syncLabels(
  workItemId: string,
  currentIds: string[],
  nextIds: string[],
  addLabel: LabelMutator,
  removeLabel: LabelMutator,
  onError: () => void,
): Promise<void> {
  try {
    await Promise.all([
      ...nextIds
        .filter((id) => !currentIds.includes(id))
        .map((labelId) => addLabel({ workItemId, labelId })),
      ...currentIds
        .filter((id) => !nextIds.includes(id))
        .map((labelId) => removeLabel({ workItemId, labelId })),
    ])
  } catch {
    onError()
  }
}

/**
 * Props for {@link useTaskDetailForm}.
 * @property workItem - The work item being viewed or edited; `null`/`undefined` in create mode.
 * @property internalMode - Current panel mode (`'create'` | `'edit'` | `'view'`).
 * @property scopeType - Scope context (project / portfolio) for mutations.
 * @property scopeId - ID of the scope entity.
 * @property boardColumnId - Optional board column to assign on creation.
 * @property onCreated - Callback fired after a successful creation with the new item's id and version.
 * @property setInternalMode - Setter to transition the panel mode.
 */
interface UseTaskDetailFormProps {
  workItem: ProjectWorkItem | null | undefined
  internalMode: DetailPanelMode
  scopeType: ScopeType
  scopeId: string
  boardColumnId?: string | null
  onCreated?: (workItemId: string, version: number) => void
  setInternalMode: (mode: DetailPanelMode) => void
}

/**
 * Manages the React Hook Form instance and create/update submit handlers
 * for the task detail panel, including label diff synchronisation.
 * @param props - See {@link UseTaskDetailFormProps}.
 * @param props.workItem - The work item being viewed or edited.
 * @param props.internalMode - Current panel mode.
 * @param props.scopeType - Scope context for mutations.
 * @param props.scopeId - ID of the scope entity.
 * @param props.boardColumnId - Optional board column to assign on creation.
 * @param props.onCreated - Callback fired after successful creation.
 * @param props.setInternalMode - Setter to transition the panel mode.
 * @returns Form instance, pending state, column assignment flag, and submit handlers.
 */
export function useTaskDetailForm({
  workItem,
  internalMode,
  scopeType,
  scopeId,
  boardColumnId,
  onCreated,
  setInternalMode,
}: UseTaskDetailFormProps) {
  const { t } = useTranslation()
  const { mutateAsync: create, isPending: isCreating } = useCreateProjectWorkItem(
    scopeType,
    scopeId,
  )
  const { mutateAsync: update, isPending: isUpdating } = useUpdateProjectWorkItem()
  const { mutateAsync: addLabel } = useAddLabelToWorkItem(scopeType, scopeId)
  const { mutateAsync: removeLabel } = useRemoveLabelFromWorkItem(scopeType, scopeId)

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: BLANK_FORM,
  })

  const { reset } = form

  const resetFormForWorkItem = useCallback(() => {
    if (!workItem) return
    reset({
      name: workItem.name,
      description: workItem.description ?? null,
      dueDate: workItem.dueDate ?? null,
      priority: (workItem.priority as EditFormValues['priority']) ?? null,
      assigneeId: workItem.assignee?.id ?? null,
      status: workItem.status ?? null,
      labelIds: workItem.labels?.map((l) => l.id) ?? [],
    })
  }, [workItem, reset])

  useEffect(() => {
    if (internalMode === 'create') {
      reset(BLANK_FORM)
    } else {
      resetFormForWorkItem()
    }
  }, [internalMode, workItem, reset, resetFormForWorkItem])

  const isPending = isCreating || isUpdating
  const isAssignedToColumn = Boolean(workItem?.boardColumn)

  async function handleCreate(values: WorkItemFormValues) {
    try {
      const created = await create({
        input: toCreateInput(values, scopeId, scopeType, boardColumnId),
      })
      onCreated?.(created.id, created.version)
      form.reset()
    } catch {
      /* hook handles toast */
    }
  }

  async function handleUpdate(values: WorkItemFormValues) {
    if (!workItem) return
    try {
      const effectiveValues = isAssignedToColumn ? { ...values, status: null } : values
      await update({ id: workItem.id, input: toUpdateInput(effectiveValues, workItem.version) })
      await syncLabels(
        workItem.id,
        workItem.labels?.map((l) => l.id) ?? [],
        values.labelIds ?? [],
        addLabel,
        removeLabel,
        () =>
          toast.error(
            t(
              'features.workItem.labelSyncError',
              'Failed to update labels. Some changes may not have been saved.',
            ),
          ),
      )
      setInternalMode('view')
    } catch {
      /* hook handles toast */
    }
  }

  // Cast is intentional: the form is created with EditFormValues (superset of WorkItemFormValues,
  // adding the optional `status` field for in-panel editing). WorkItemFormHandle is structurally
  // compatible at runtime; the cast is isolated here so call sites need no escapes.
  return {
    form: form as unknown as WorkItemFormHandle,
    isPending,
    isAssignedToColumn,
    handleCreate,
    handleUpdate,
  }
}
