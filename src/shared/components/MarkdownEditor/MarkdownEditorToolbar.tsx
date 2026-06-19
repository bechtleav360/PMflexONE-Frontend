import { useEditorState, type Editor } from '@tiptap/react'
import { useTranslation } from 'react-i18next'

import {
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components'
import { cn } from '@/shared/lib/utils'

import { markdownEditorToolbarConfig } from './markdownEditorToolbarConfig'

interface MarkdownEditorToolbarProps {
  editor: Editor | null
  disabled?: boolean
  className?: string
}

type HistoryButton = (typeof markdownEditorToolbarConfig.historyButtons)[number]
type InlineButton = (typeof markdownEditorToolbarConfig.inlineFormattingButtons)[number]
type StructureButton = (typeof markdownEditorToolbarConfig.structureButtons)[number]
type ToolbarButtonConfig = HistoryButton | InlineButton | StructureButton

type ToolbarAction = HistoryButton['onClick']

/**
 * Toolbar with history, inline formatting, and structure buttons for the markdown editor.
 * @param props - Toolbar props.
 * @param props.editor - Tiptap editor instance, or null before mount.
 * @param props.disabled - Whether all toolbar buttons are disabled.
 * @param props.className - Additional class applied to the toolbar container.
 * @returns The rendered toolbar row, or null when editor is not ready.
 */
export function MarkdownEditorToolbar({
  editor,
  disabled = false,
  className,
}: MarkdownEditorToolbarProps) {
  const { t } = useTranslation()
  const linkPrompt = t('shared.textEditor.linkPrompt')
  const toolbarState =
    useEditorState({
      editor,
      selector: ({ editor: currentEditor }) =>
        markdownEditorToolbarConfig.buildToolbarState(currentEditor),
    }) ?? markdownEditorToolbarConfig.defaultToolbarState
  const isDisabled = disabled || !editor

  const handleButtonClick = (action: ToolbarAction) => () => {
    if (!editor || disabled) {
      return
    }

    action(editor, { linkPrompt })
  }

  return (
    <TooltipProvider>
      <div
        role="toolbar"
        aria-label={t('shared.textEditor.toolbarLabel')}
        className={cn(
          'bg-muted flex flex-wrap items-center gap-[3px] rounded-md border px-[6px] py-[5px]',
          isDisabled && 'pointer-events-none opacity-[0.45]',
          className,
        )}
      >
        {markdownEditorToolbarConfig.historyButtons.map((button) =>
          renderToolbarButton({
            active: false,
            button,
            disabled: isDisabled || !(button.isEnabled?.(toolbarState) ?? false),
            label: t(button.labelKey),
            onClick: handleButtonClick(button.onClick),
          }),
        )}

        <Separator
          orientation="vertical"
          className="mx-[3px] h-5"
        />

        {markdownEditorToolbarConfig.inlineFormattingButtons.map((button) =>
          renderToolbarButton({
            active: button.active?.(editor) ?? false,
            button,
            disabled: isDisabled,
            label: t(button.labelKey),
            onClick: handleButtonClick(button.onClick),
          }),
        )}

        <Separator
          orientation="vertical"
          className="mx-[3px] h-5"
        />

        {markdownEditorToolbarConfig.structureButtons.map((button) =>
          renderToolbarButton({
            active: button.active?.(editor) ?? false,
            button,
            disabled: isDisabled,
            label: t(button.labelKey),
            onClick: handleButtonClick(button.onClick),
          }),
        )}
      </div>
    </TooltipProvider>
  )
}

interface RenderToolbarButtonProps {
  button: ToolbarButtonConfig
  label: string
  disabled: boolean
  active: boolean
  onClick: () => void
}

function renderToolbarButton({
  button,
  label,
  disabled,
  active,
  onClick,
}: RenderToolbarButtonProps) {
  return (
    <Tooltip key={button.labelKey}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          aria-pressed={active}
          className={cn(
            'text-muted-foreground size-9 cursor-pointer rounded-sm border border-transparent bg-transparent',
            'inline-flex items-center justify-center font-[inherit]',
            'transition-[background,color,border-color] duration-100',
            'hover:bg-background hover:border-border hover:text-foreground',
            'focus-visible:shadow-[var(--focus)] focus-visible:outline-none',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-[0.35]',
            active && 'bg-accent text-accent-foreground border-primary/20',
          )}
        >
          {button.textLabel ? (
            <span className="text-[10px] font-[800] tracking-[.02em]">{button.textLabel}</span>
          ) : (
            <button.Icon className="size-3.5" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
