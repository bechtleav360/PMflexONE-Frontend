import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Button, MarkdownEditor } from '@/shared/components'

import { useCreateComment } from '../../hooks/useCreateComment'

interface CommentFormProps {
  workItemId: string
}

/**
 * Markdown input form for creating new comments on a work item.
 * @param root0 - Component props.
 * @param root0.workItemId - The work item to comment on.
 * @returns The comment creation form element.
 */
export function CommentForm({ workItemId }: CommentFormProps) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const { mutateAsync, isPending } = useCreateComment(workItemId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    try {
      await mutateAsync({ text })
      setText('')
    } catch {
      // onError in hook handles user-facing feedback
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2"
    >
      <p className="text-muted-foreground text-xs font-medium">
        {t('features.workItemComments.form.heading', 'New Comment')}
      </p>
      <MarkdownEditor
        value={text}
        onChange={setText}
        placeholder={t('features.workItemComments.form.placeholder', 'Add a comment…')}
        ariaLabel={t('features.workItemComments.form.label', 'Comment text')}
        disabled={isPending}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={isPending || !text.trim()}
        >
          {isPending
            ? t('common.saving', 'Saving…')
            : t('features.workItemComments.form.submit', 'Add Comment')}
        </Button>
      </div>
    </form>
  )
}
