import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import type { Comment } from '@/entities/work-item'
import { Button, MarkdownContent } from '@/shared/components'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import { formatPersonName } from '@/shared/lib/utils'

import { useDeleteComment } from '../../hooks/useDeleteComment'
import { useUpdateComment } from '../../hooks/useUpdateComment'
import { CommentDeleteDialog } from './CommentDeleteDialog'
import { CommentEditForm } from './CommentEditForm'

interface CommentItemProps {
  workItemId: string
  comment: Comment
}

/**
 * Renders a single comment with author-gated inline edit and delete controls.
 * @param root0 - Component props.
 * @param root0.workItemId - The work item the comment belongs to.
 * @param root0.comment - The comment to display.
 * @returns The comment item element.
 */
export function CommentItem({ workItemId, comment }: CommentItemProps) {
  const { t } = useTranslation()
  const { data: currentUser } = useCurrentUser()
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.text)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { mutateAsync: deleteComment, isPending: isDeleting } = useDeleteComment(workItemId)
  const { mutateAsync: updateComment, isPending: isUpdating } = useUpdateComment(workItemId)

  const isAuthor = Boolean(currentUser?.mail && currentUser.mail === comment.creator?.mail)

  async function handleDelete() {
    try {
      await deleteComment({ id: comment.id })
      setConfirmDelete(false)
    } catch {
      // onError in hook handles user-facing feedback
    }
  }

  async function handleUpdate() {
    try {
      await updateComment({ id: comment.id, version: comment.version, text: editText })
      setIsEditing(false)
    } catch {
      // onError in hook handles user-facing feedback
    }
  }

  const authorName = formatPersonName(comment.creator, t('common.unknown', 'Unknown'))

  return (
    <article className="bg-card rounded-md border p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{authorName}</span>
        <span className="text-muted-foreground text-xs">
          {new Date(comment.createdAt).toLocaleString()}
        </span>
        {isAuthor && !isEditing && (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsEditing(true)
                setEditText(comment.text)
              }}
              aria-label={t('features.workItemComments.editComment', 'Edit comment')}
            >
              {t('common.edit', 'Edit')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
              aria-label={t('features.workItemComments.deleteComment', 'Delete comment')}
            >
              {t('common.delete', 'Delete')}
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <CommentEditForm
          editText={editText}
          isUpdating={isUpdating}
          onChange={setEditText}
          onCancel={() => setIsEditing(false)}
          onSave={handleUpdate}
        />
      ) : (
        <MarkdownContent value={comment.text} />
      )}

      <CommentDeleteDialog
        open={confirmDelete}
        isDeleting={isDeleting}
        onOpenChange={setConfirmDelete}
        onDelete={handleDelete}
      />
    </article>
  )
}
