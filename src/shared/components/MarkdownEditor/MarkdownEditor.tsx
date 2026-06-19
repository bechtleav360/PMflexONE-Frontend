import { MarkdownEditorView } from './MarkdownEditorView'
import { useMarkdownEditor } from './useMarkdownEditor'

interface MarkdownEditorProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  placeholder?: string
  ariaLabel?: string
  className?: string
  toolbarClassName?: string
  editorClassName?: string
  disabled?: boolean
}

/**
 * A markdown-backed rich text editor with common formatting controls.
 *
 * @param props - Component props.
 * @param props.value - Controlled markdown value.
 * @param props.defaultValue - Initial markdown value for uncontrolled usage.
 * @param props.onChange - Called whenever the markdown content changes.
 * @param props.placeholder - Optional editor placeholder.
 * @param props.ariaLabel - Optional accessible label for the editable region.
 * @param props.className - Optional wrapper class name.
 * @param props.toolbarClassName - Optional toolbar wrapper class name.
 * @param props.editorClassName - Optional editor surface class name.
 * @param props.disabled - Whether the editor is read-only.
 * @returns A markdown editor with a formatting toolbar.
 */
export function MarkdownEditor({
  value,
  defaultValue,
  onChange,
  placeholder,
  ariaLabel,
  className,
  toolbarClassName,
  editorClassName,
  disabled = false,
}: MarkdownEditorProps) {
  const { editor, isDisabled } = useMarkdownEditor({
    value,
    defaultValue,
    onChange,
    placeholder,
    ariaLabel,
    editorClassName,
    disabled,
  })

  return (
    <MarkdownEditorView
      editor={editor}
      isDisabled={isDisabled}
      className={className}
      toolbarClassName={toolbarClassName}
      editorClassName={editorClassName}
    />
  )
}
