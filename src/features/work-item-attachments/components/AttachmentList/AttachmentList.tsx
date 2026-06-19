import { useState } from 'react'

import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import type { Attachment } from '@/entities/work-item'
import { FileUpload } from '@/shared/components'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'

import {
  ALLOWED_ATTACHMENT_EXTENSIONS,
  ALLOWED_ATTACHMENT_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
} from '../../api/attachmentApi'
import { useDeleteAttachment } from '../../hooks/useDeleteAttachment'
import { useUploadAttachment } from '../../hooks/useUploadAttachment'
import { AttachmentItem } from './AttachmentItem'
import { DeleteConfirmSection } from './DeleteConfirmSection'

interface AttachmentListProps {
  workItemId: string
  attachments: Attachment[]
  isFetching?: boolean
}

type ConfirmTarget = { id: string; version: number; name: string } | null

const ACCEPT = ALLOWED_ATTACHMENT_TYPES.join(',')

type TFunction = ReturnType<typeof useTranslation>['t']

function filterValidFiles(files: File[], t: TFunction): File[] {
  const valid: File[] = []
  for (const file of files) {
    const ext = file.name.includes('.') ? (file.name.split('.').pop()?.toLowerCase() ?? '') : ''
    if (!ALLOWED_ATTACHMENT_EXTENSIONS.has(ext) || !ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
      toast.error(
        t(
          'features.workItemAttachments.errors.invalidType',
          '"{{name}}" — file type not allowed.',
          { name: file.name },
        ),
      )
      continue
    }
    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      toast.error(
        t(
          'features.workItemAttachments.errors.tooLarge',
          '"{{name}}" — exceeds the 10 MB size limit.',
          { name: file.name },
        ),
      )
      continue
    }
    valid.push(file)
  }
  return valid
}

/**
 * Renders the attachment list for a work item: file name, size, uploader, timestamp,
 * download link, owner-gated delete with confirmation, and an upload control that
 * enforces the FA5 type/size whitelist.
 *
 * @param root0 - Component props.
 * @param root0.workItemId - The work item owning the attachments.
 * @param root0.attachments - Attachment records to display.
 * @param root0.isFetching - Whether the parent query is currently refetching.
 * @returns The attachments section element.
 */
export function AttachmentList({
  workItemId,
  attachments,
  isFetching = false,
}: AttachmentListProps) {
  const { t } = useTranslation()
  const { data: currentUser } = useCurrentUser()
  const { mutateAsync: deleteAtt, isPending: isDeleting } = useDeleteAttachment(workItemId)
  const { mutate: upload, isPending: isUploading } = useUploadAttachment(workItemId)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null)

  async function handleDeleteConfirmed() {
    if (!confirmTarget) return
    try {
      await deleteAtt({ id: confirmTarget.id, version: confirmTarget.version })
    } catch {
      // hook's onError handles the toast
    } finally {
      setConfirmTarget(null)
    }
  }

  function handleFilesChange(files: File[]) {
    const added = files.filter((f) => !pendingFiles.includes(f))
    if (!added.length) {
      setPendingFiles(files)
      return
    }
    const valid = filterValidFiles(added, t)
    if (!valid.length) return
    setPendingFiles(files)
    upload(valid, { onSettled: () => setPendingFiles([]) })
  }

  return (
    <>
      <DeleteConfirmSection
        confirmTarget={confirmTarget}
        isDeleting={isDeleting}
        onOpenChange={() => setConfirmTarget(null)}
        onConfirm={() => {
          void handleDeleteConfirmed()
        }}
      />
      <section aria-label={t('features.workItemAttachments.list', 'Attachments')}>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          {t('features.workItemAttachments.list', 'Attachments')}
          {(isUploading || isFetching) && (
            <Loader2 className="text-muted-foreground h-3.5 w-3.5 animate-spin" />
          )}
        </h3>
        {attachments.length === 0 ? (
          <p className="text-muted-foreground mb-3 text-sm">
            {t('features.workItemAttachments.noAttachments', 'No attachments.')}
          </p>
        ) : (
          <ul className="mb-4 space-y-1">
            {attachments.map((att) => (
              <AttachmentItem
                key={att.id}
                att={att}
                isOwner={
                  !!att.creator &&
                  !!currentUser &&
                  // compare by email which is the same in both identity systems.
                  (currentUser.mail !== '' && att.creator.mail != null
                    ? currentUser.mail === att.creator.mail
                    : currentUser.id === att.creator.id)
                }
                onDeleteRequest={setConfirmTarget}
              />
            ))}
          </ul>
        )}
        <FileUpload
          files={pendingFiles}
          onFilesChange={handleFilesChange}
          accept={ACCEPT}
          disabled={isUploading}
          labels={{
            button: t('features.workItemAttachments.uploadFile', 'Upload file'),
            dropzoneTitle: t(
              'features.workItemAttachments.dropzoneTitle',
              'Drag and drop a file here',
            ),
            dropzoneDescription: t(
              'features.workItemAttachments.dropzoneDescription',
              'or click to select a file (max 10 MB)',
            ),
          }}
        />
      </section>
    </>
  )
}
