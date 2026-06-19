import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { WORK_ITEM_ATTACHMENTS_QUERY_KEY } from '@/entities/work-item'
import type { Attachment } from '@/entities/work-item'

import {
  assetContentUrl,
  createAttachment,
  deleteAttachment,
  uploadAsset,
  UploadError,
} from '../api/attachmentApi'

/**
 * Mutation hook that uploads one or more files as attachments on a work item.
 *
 * For each file: creates an attachment record, uploads the binary, rolls back the
 * record if the upload fails. All files are processed in parallel.
 *
 * On success:
 * 1. Optimistically inserts placeholder attachments (storageKey null) into the cache
 *    so the list updates immediately using the original file names.
 * 2. Invalidates the query so enriched storageKeys replace the placeholders once ready.
 *
 * @param workItemId - The work item the attachments belong to.
 * @returns TanStack Query mutation result; call `mutate(files)` to trigger the uploads.
 */
export function useUploadAttachment(workItemId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (files: File[]) => {
      const results = await Promise.allSettled(
        files.map(async (file) => {
          // Store fileName in metadata so it can be recovered after a page refresh
          // without depending on backend asset enrichment (which sets fileName on the
          // attachment record asynchronously and may be delayed).
          const attachment = await createAttachment(workItemId, {
            metadata: JSON.stringify({ fileName: file.name }),
          })
          try {
            await uploadAsset(file, attachment.id)
          } catch (err) {
            await deleteAttachment(attachment.id, attachment.version)
            throw err
          }
          return { attachment, file }
        }),
      )

      const succeeded = results
        .filter(
          (
            r,
          ): r is PromiseFulfilledResult<{
            attachment: { id: string; version: number }
            file: File
          }> => r.status === 'fulfilled',
        )
        .map((r) => r.value)

      results.forEach((result, i) => {
        if (result.status !== 'rejected') return
        const err = result.reason
        if (err instanceof UploadError && err.serverCode === 'ASSET_MIME_MISMATCH') {
          toast.error(
            t('features.workItemAttachments.errors.mimeMismatch', { name: files[i].name }),
          )
        } else if (
          err instanceof UploadError &&
          (err.status === 415 || err.serverCode === 'ASSET_DISALLOWED_TYPE')
        ) {
          toast.error(
            t('features.workItemAttachments.errors.serverTypeRejected', { name: files[i].name }),
          )
        } else {
          toast.error(
            t('features.workItemAttachments.errors.uploadFailed', { name: files[i].name }),
          )
        }
      })

      return succeeded
    },
    onSuccess: (uploads) => {
      if (!uploads.length) return

      toast.success(
        t('features.workItemAttachments.uploadSuccessCount', '{{count}} attachment(s) uploaded.', {
          count: uploads.length,
        }),
      )

      const queryKey = WORK_ITEM_ATTACHMENTS_QUERY_KEY(workItemId)

      queryClient.setQueryData<Attachment[]>(queryKey, (old) => [
        ...(old ?? []),
        ...uploads.map(({ attachment, file }) => ({
          id: attachment.id,
          version: attachment.version,
          fileName: file.name,
          // Derive the content URL from the attachment ID — same path used for upload.
          // This avoids waiting for backend enrichment to set storageKey.
          storageKey: assetContentUrl(attachment.id),
          size: file.size,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: JSON.stringify({ fileName: file.name }),
          creator: null,
        })),
      ])

      // Mark stale without an immediate background refetch so the polling interval
      // in useWorkItemAttachments drives the next fetch rather than a race-prone
      // ad-hoc refetch.
      void queryClient.invalidateQueries({ queryKey, refetchType: 'none' })
    },
    onError: () => {
      toast.error(t('features.workItemAttachments.uploadError'))
    },
  })
}
