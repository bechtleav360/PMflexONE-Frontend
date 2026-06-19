import { Check, X } from 'lucide-react'

import { Button, DatePicker, MarkdownEditor } from '@/shared/components'

interface StakeholderLogInlineEditRowProps {
  date: Date | null
  content: string
  contentPlaceholder: string
  onDateChange: (d: Date | null) => void
  onContentChange: (v: string) => void
  onConfirm: () => void
  onCancel: () => void
  confirmDisabled: boolean
  confirmLabel: string
  cancelLabel: string
}

/**
 * Inline edit row for a stakeholder log entry.
 *
 * Renders a two-row layout: a top row with a date picker and confirm/cancel
 * action buttons, followed by a full-width `MarkdownEditor` for the log body.
 *
 * Used for both the "new entry" draft row and the in-place edit mode of an
 * existing log entry in `StakeholderLogsTab`.
 *
 * @param props - Component props.
 * @param props.date - Currently selected date (controlled).
 * @param props.content - Current markdown content string (controlled).
 * @param props.contentPlaceholder - Placeholder shown in the editor when empty.
 * @param props.onDateChange - Called with the new `Date` (or `null`) when the
 *   date picker value changes.
 * @param props.onContentChange - Called with the new markdown string whenever
 *   the editor content changes.
 * @param props.onConfirm - Called when the user clicks the confirm (check) button.
 * @param props.onCancel - Called when the user clicks the cancel (×) button.
 * @param props.confirmDisabled - Whether the confirm button should be disabled.
 * @param props.confirmLabel - Accessible label (and tooltip) for the confirm button.
 * @param props.cancelLabel - Accessible label (and tooltip) for the cancel button.
 * @returns The inline edit row element.
 */
export function StakeholderLogInlineEditRow({
  date,
  content,
  contentPlaceholder,
  onDateChange,
  onContentChange,
  onConfirm,
  onCancel,
  confirmDisabled,
  confirmLabel,
  cancelLabel,
}: StakeholderLogInlineEditRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <DatePicker
          className="w-36 shrink-0"
          value={date}
          onChange={onDateChange}
        />
        <div className="ml-auto flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onConfirm}
            disabled={confirmDisabled}
            aria-label={confirmLabel}
            title={confirmLabel}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onCancel}
            aria-label={cancelLabel}
            title={cancelLabel}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <MarkdownEditor
        value={content}
        onChange={onContentChange}
        placeholder={contentPlaceholder}
      />
    </div>
  )
}
