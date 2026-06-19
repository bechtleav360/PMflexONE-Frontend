import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/** Props for the ColumnFooter component. */
export interface ColumnFooterProps {
  onAddTask?: () => void
}

/**
 * Footer row of a board column with an "Add a task" button.
 * @param root0 - Component props.
 * @param root0.onAddTask - Called when the user clicks "Add a task".
 * @returns The column footer element.
 */
export function ColumnFooter({ onAddTask }: ColumnFooterProps) {
  const { t } = useTranslation()
  return (
    <div className="border-border shrink-0 border-t px-1 py-1">
      <button
        type="button"
        onClick={onAddTask}
        className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors"
        aria-label={t('features.workItem.board.addTaskToColumn', 'Add a task')}
      >
        <Plus className="h-4 w-4" />
        {t('features.workItem.board.addTaskToColumn', 'Add a task')}
      </button>
    </div>
  )
}
