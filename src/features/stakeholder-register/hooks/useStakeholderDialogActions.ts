import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import type { StakeholderLog } from '@/entities/stakeholder'
import { getStakeholderEntriesQueryKey } from '@/entities/stakeholder'
import type { ScopeType } from '@/shared/types/scopeType'

import {
  createStakeholderLog,
  deleteStakeholderLog,
  updateStakeholderLog,
} from '../api/stakeholderLogApi'
import { useStakeholderDialogStore } from '../store/useStakeholderDialogStore'
import { formValuesToCreateInput, formValuesToUpdateInput } from '../utils/stakeholderMappers'
import type { StakeholderFormValues, StakeholderLogValue } from '../utils/stakeholderSchema'
import { useCreateStakeholder } from './useCreateStakeholder'
import { useUpdateStakeholder } from './useUpdateStakeholder'

/** Props for {@link useStakeholderDialogActions}. */
export interface StakeholderDialogActionsProps {
  scopeType: ScopeType
  scopeId: string
}

/**
 * Diff form logs against the original server logs and call the appropriate
 * log mutations (create / update / delete) in parallel.
 *
 * Direct API calls are intentional here: this is a fire-and-forget diff sync
 * invoked after `updateMutation.mutateAsync` resolves. TanStack Query retry and
 * optimistic-update infrastructure add no value because a full invalidation of
 * the stakeholder entries query follows in the `finally` block regardless of
 * partial failure. Using `useMutation` for each individual log operation would
 * require managing N separate mutation states without meaningful benefit.
 *
 * @param entryId - The ID of the parent stakeholder entry.
 * @param originalLogs - The server-persisted logs before the user edited the form.
 * @param formLogs - The current log values from the form (may include new, modified, or removed logs).
 */
async function syncLogs(
  entryId: string,
  originalLogs: StakeholderLog[],
  formLogs: StakeholderLogValue[],
) {
  const originalById = new Map(originalLogs.map((l) => [l.id, l]))
  const formById = new Map(formLogs.map((l) => [l.id, l]))

  const ops: Promise<unknown>[] = []

  // New logs — no version means not yet persisted
  for (const log of formLogs) {
    if (log.version === undefined) {
      ops.push(createStakeholderLog(entryId, { date: log.date, content: log.content }))
    }
  }

  // Updated logs — existing server log whose date or content changed
  for (const log of formLogs) {
    if (log.version !== undefined) {
      const original = originalById.get(log.id)
      if (original && (original.date !== log.date || original.content !== log.content)) {
        ops.push(
          updateStakeholderLog(log.id, log.version, { date: log.date, content: log.content }),
        )
      }
    }
  }

  // Deleted logs — in original but absent from the form
  for (const original of originalLogs) {
    if (!formById.has(original.id)) {
      ops.push(deleteStakeholderLog(original.id, original.version))
    }
  }

  await Promise.all(ops)
}

/**
 * Provides the `handleSave` callback for the stakeholder dialog.
 *
 * Dispatches either a create or update mutation based on the current store
 * payload, then diffs and syncs activity log entries. Closes the dialog on
 * completion regardless of success or failure.
 *
 * In edit mode the entry update and the log sync each get their own toast so a
 * log-sync failure does not mask a successful entry update.
 *
 * @param props - Scope context required for query invalidation.
 * @param props.scopeType - The type of scope (Project, Program, Portfolio).
 * @param props.scopeId - The ID of the scope.
 * @returns An object containing the `handleSave` async function.
 */
export function useStakeholderDialogActions({ scopeType, scopeId }: StakeholderDialogActionsProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const payload = useStakeholderDialogStore((s) => s.payload)
  const closeModal = useStakeholderDialogStore((s) => s.closeModal)
  const createMutation = useCreateStakeholder()
  const updateMutation = useUpdateStakeholder()

  async function handleSave(values: StakeholderFormValues) {
    const formLogs = values.logs ?? []

    if (payload) {
      // ── Edit mode ────────────────────────────────────────────────────────
      // Track the entry update separately so a log-sync failure doesn't
      // replace the "Stakeholder updated" success with a generic error toast.
      const entryPromise = updateMutation.mutateAsync({
        id: payload.id,
        version: payload.version,
        input: formValuesToUpdateInput(values),
        scopeType,
        scopeId,
      })

      toast.promise(entryPromise, {
        loading: t('pages.stakeholderRegister.toast.updateLoading'),
        success: t('pages.stakeholderRegister.toast.updateSuccess'),
        error: t('pages.stakeholderRegister.toast.updateError'),
      })

      // Sync logs after entry update; use a distinct error toast so the user
      // knows the entry itself was saved even if log sync partially fails.
      entryPromise
        .then(async () => {
          try {
            await syncLogs(payload.id, payload.logs, formLogs)
          } catch {
            toast.error(t('pages.stakeholderRegister.toast.logSyncError'))
          } finally {
            // Re-invalidate regardless — partial log changes should be visible.
            await queryClient.invalidateQueries({
              queryKey: getStakeholderEntriesQueryKey(scopeType, scopeId),
            })
          }
        })
        .catch(() => {
          // Entry update failed; toast.promise already shows the error — suppress
          // the secondary unhandled rejection from this .then() chain.
        })
    } else {
      // ── Create mode ───────────────────────────────────────────────────────
      const promise = createMutation
        .mutateAsync(formValuesToCreateInput(values, scopeType, scopeId))
        .then(async (created) => {
          if (formLogs.length) {
            await Promise.all(
              formLogs.map((log) =>
                createStakeholderLog(created.id, { date: log.date, content: log.content }),
              ),
            )
            // Re-invalidate after log creation so the cache reflects new logs
            await queryClient.invalidateQueries({
              queryKey: getStakeholderEntriesQueryKey(scopeType, scopeId),
            })
          }
        })

      toast.promise(promise, {
        loading: t('pages.stakeholderRegister.toast.createLoading'),
        success: t('pages.stakeholderRegister.toast.createSuccess'),
        error: t('pages.stakeholderRegister.toast.createError'),
      })
    }

    closeModal()
  }

  return { handleSave }
}
