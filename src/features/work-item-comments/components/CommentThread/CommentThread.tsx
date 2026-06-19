import { useTranslation } from 'react-i18next'

import { useComments } from '@/entities/work-item'

import { CommentForm } from '../CommentForm/CommentForm'
import { CommentItem } from '../CommentItem/CommentItem'

interface CommentThreadProps {
  workItemId: string
}

/**
 * Renders the full comment thread for a work item with a new-comment form at the bottom.
 * @param root0 - Component props.
 * @param root0.workItemId - The work item whose comments to display.
 * @returns The comment thread section element.
 */
export function CommentThread({ workItemId }: CommentThreadProps) {
  const { t } = useTranslation()
  const { data: comments = [], isLoading } = useComments(workItemId)

  return (
    <section aria-label={t('features.workItemComments.thread', 'Comments')}>
      <h3 className="mb-3 text-sm font-semibold">
        {t('features.workItemComments.thread', 'Comments')}
      </h3>

      {isLoading && (
        <p className="text-muted-foreground text-sm">{t('common.loading', 'Loading…')}</p>
      )}

      {!isLoading && comments.length === 0 && (
        <p className="text-muted-foreground mb-3 text-sm">
          {t('features.workItemComments.noComments', 'No comments yet.')}
        </p>
      )}

      <ul className="mb-4 space-y-2">
        {comments.map((comment) => (
          <li key={comment.id}>
            <CommentItem
              workItemId={workItemId}
              comment={comment}
            />
          </li>
        ))}
      </ul>

      <CommentForm workItemId={workItemId} />
    </section>
  )
}
