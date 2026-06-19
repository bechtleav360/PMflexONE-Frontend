import { useTranslation } from 'react-i18next'

import { Button, MarkdownEditor } from '@/shared/components'

/** Props for the CommentEditForm component. */
export interface CommentEditFormProps {
  editText: string
  isUpdating: boolean
  onChange: (v: string) => void
  onCancel: () => void
  onSave: () => void
}

/**
 * Inline edit form for a comment, with a markdown editor and save/cancel actions.
 * @param root0 - Component props.
 * @param root0.editText - Current editor content.
 * @param root0.isUpdating - Whether a save mutation is in flight.
 * @param root0.onChange - Called with the new text on every editor change.
 * @param root0.onCancel - Called when the user cancels editing.
 * @param root0.onSave - Called when the user confirms the edit.
 * @returns The edit form element.
 */
export function CommentEditForm({
  editText,
  isUpdating,
  onChange,
  onCancel,
  onSave,
}: CommentEditFormProps) {
  const { t } = useTranslation()
  return (
    <div className="space-y-2">
      <MarkdownEditor
        value={editText}
        onChange={onChange}
        disabled={isUpdating}
      />
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={isUpdating}
        >
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={isUpdating}
        >
          {isUpdating ? t('common.saving', 'Saving…') : t('common.save', 'Save')}
        </Button>
      </div>
    </div>
  )
}
