import { useEffect, useMemo } from 'react'

import { useEditor, type Editor } from '@tiptap/react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/utils'

import { buildMarkdownEditorExtensions, MARKDOWN_CONTENT_CLASSES } from './markdownEditorExtensions'

interface UseMarkdownEditorOptions {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  placeholder?: string
  ariaLabel?: string
  editorClassName?: string
  disabled?: boolean
}

interface MarkdownEditorHookResult {
  editor: Editor | null
  isDisabled: boolean
}

function buildMarkdownEditorAttributes(resolvedAriaLabel: string, editorClassName?: string) {
  return {
    class: cn(
      'w-full outline-none text-sm leading-[1.65]',
      'placeholder:text-muted-foreground',
      MARKDOWN_CONTENT_CLASSES,
      '[&_.is-empty::before]:pointer-events-none',
      '[&_.is-empty::before]:float-left',
      '[&_.is-empty::before]:h-0',
      '[&_.is-empty::before]:text-muted-foreground',
      '[&_.is-empty::before]:content-[attr(data-placeholder)]',
      '[&_.is-empty::before]:opacity-60',
      editorClassName,
    ),
    'aria-label': resolvedAriaLabel,
    'aria-multiline': 'true',
    role: 'textbox',
  }
}

function syncMarkdownContent(
  editor: Editor | null,
  nextValue: string | undefined,
  isSyncingContent: { current: boolean },
) {
  if (!editor || nextValue === undefined) {
    return
  }

  const currentMarkdown = editor.getMarkdown()

  if (nextValue !== currentMarkdown) {
    isSyncingContent.current = true
    editor.commands.setContent(nextValue, { contentType: 'markdown' })
    isSyncingContent.current = false
  }
}

/**
 * Creates and synchronises the shared markdown editor instance.
 *
 * @param options - Editor configuration and callbacks.
 * @param options.value - Controlled markdown value.
 * @param options.defaultValue - Initial markdown value for uncontrolled usage.
 * @param options.onChange - Called whenever the markdown content changes.
 * @param options.placeholder - Optional editor placeholder.
 * @param options.ariaLabel - Optional accessible label for the editable region.
 * @param options.editorClassName - Optional editor surface class name.
 * @param options.disabled - Whether the editor is read-only.
 * @returns The editor instance plus the computed disabled state.
 */
export function useMarkdownEditor({
  value,
  defaultValue,
  onChange,
  placeholder,
  ariaLabel,
  editorClassName,
  disabled = false,
}: UseMarkdownEditorOptions): MarkdownEditorHookResult {
  const { t } = useTranslation()
  const isSyncingContent = useMemo(() => ({ current: false }), [])
  const initialContent = value ?? defaultValue ?? ''
  const resolvedPlaceholder = placeholder ?? t('shared.textEditor.placeholder')
  const resolvedAriaLabel = ariaLabel ?? t('shared.textEditor.editorLabel')

  // Extensions are built once with the initial placeholder. Subsequent
  // placeholder changes (e.g. on i18n init) are applied in the useEffect below
  // by mutating extension options in-place, which avoids a ProseMirror plugin
  // reconfiguration that would otherwise reset undo history.
  const extensions = useMemo(
    () => buildMarkdownEditorExtensions(resolvedPlaceholder),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: extensions built once with initial placeholder; subsequent changes applied by in-place mutation to avoid ProseMirror plugin reconfiguration that resets undo history
    [],
  )

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions,
    content: initialContent,
    contentType: 'markdown',
    editorProps: {
      attributes: buildMarkdownEditorAttributes(resolvedAriaLabel, editorClassName),
    },
    onUpdate: ({ editor: nextEditor }) => {
      if (isSyncingContent.current) {
        return
      }

      onChange?.(nextEditor.getMarkdown())
    },
  })

  useEffect(() => {
    editor?.setEditable(!disabled, false)
  }, [disabled, editor])

  useEffect(() => {
    syncMarkdownContent(editor, value, isSyncingContent)
  }, [editor, isSyncingContent, value])

  // Update placeholder text without rebuilding extensions (which would reset
  // ProseMirror plugin state and clear undo history). The Placeholder extension
  // reads `options.placeholder` on every decoration pass, so mutating it and
  // dispatching a no-op transaction is sufficient to refresh the hint text.
  useEffect(() => {
    if (!editor) return
    const ext = editor.extensionManager.extensions.find((e) => e.name === 'placeholder')
    if (ext) {
      ext.options.placeholder = resolvedPlaceholder
      editor.view.dispatch(editor.view.state.tr)
    }
  }, [editor, resolvedPlaceholder])

  return {
    editor,
    isDisabled: disabled || !editor,
  }
}
