import { EditorContent, type Editor } from '@tiptap/react'

import { cn } from '@/shared/lib/utils'

import { MarkdownEditorToolbar } from './MarkdownEditorToolbar'

interface MarkdownEditorViewProps {
  editor: Editor | null
  isDisabled: boolean
  className?: string
  toolbarClassName?: string
  editorClassName?: string
}

/**
 * Pure view layer combining the toolbar and Tiptap editor content.
 * @param props - View props.
 * @param props.editor - Tiptap editor instance.
 * @param props.isDisabled - Whether the editor and toolbar are disabled.
 * @param props.className - Class applied to the outer wrapper.
 * @param props.toolbarClassName - Class forwarded to the toolbar.
 * @param props.editorClassName - Class applied to the Tiptap content area.
 * @returns The toolbar stacked above the editor content area.
 */
export function MarkdownEditorView({
  editor,
  isDisabled,
  className,
  toolbarClassName,
  editorClassName,
}: MarkdownEditorViewProps) {
  return (
    <div className={cn('gap-sm flex flex-col', className)}>
      <MarkdownEditorToolbar
        editor={editor}
        disabled={isDisabled}
        className={toolbarClassName}
      />

      {/* role="presentation" marks this as a layout wrapper — the real interactive
          content is EditorContent inside. onClick/onKeyDown focus the editor when
          the user clicks the padding/border area around the content. */}
      <div
        role="none"
        className={cn(
          'bg-card min-h-[148px] rounded-md border px-[14px] py-3 shadow-sm',
          'transition-[border-color,box-shadow] duration-[120ms]',
          'focus-within:border-primary focus-within:shadow-[var(--focus)]',
          isDisabled && 'pointer-events-none cursor-not-allowed opacity-60',
        )}
        onClick={() => editor?.commands.focus()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') editor?.commands.focus()
        }}
      >
        <EditorContent
          editor={editor}
          className={editorClassName}
        />
      </div>
    </div>
  )
}
