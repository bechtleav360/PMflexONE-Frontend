import { type Editor } from '@tiptap/react'
import {
  Bold,
  Code,
  FileCode,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo,
  RemoveFormatting,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo,
  type LucideIcon,
} from 'lucide-react'

interface ToolbarState {
  isBold: boolean
  isItalic: boolean
  isUnderline: boolean
  isStrike: boolean
  isInlineCode: boolean
  isLink: boolean
  isHeading1: boolean
  isHeading2: boolean
  isHeading3: boolean
  isBulletList: boolean
  isOrderedList: boolean
  isBlockquote: boolean
  isCodeBlock: boolean
  canUndo: boolean
  canRedo: boolean
}

interface ToolbarButtonConfig {
  labelKey: string
  Icon: LucideIcon
  textLabel?: string
  isEnabled?: (state: ToolbarState) => boolean
  active?: (editor: Editor | null) => boolean
  onClick: ToolbarAction
}

interface ToolbarActionContext {
  linkPrompt: string
}

type ToolbarAction = (editor: Editor, context: ToolbarActionContext) => void

function toggleLink(editor: Editor, { linkPrompt }: ToolbarActionContext) {
  const currentUrl = editor.getAttributes('link').href as string | undefined
  const nextUrl = window.prompt(linkPrompt, currentUrl ?? 'https://')

  if (nextUrl === null) {
    return
  }

  const trimmedUrl = nextUrl.trim()

  if (!trimmedUrl) {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  editor.chain().focus().extendMarkRange('link').setLink({ href: trimmedUrl }).run()
}

function clearFormatting(editor: Editor) {
  editor.chain().focus().clearNodes().unsetAllMarks().setParagraph().run()
}

const defaultToolbarState: ToolbarState = {
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrike: false,
  isInlineCode: false,
  isLink: false,
  isHeading1: false,
  isHeading2: false,
  isHeading3: false,
  isBulletList: false,
  isOrderedList: false,
  isBlockquote: false,
  isCodeBlock: false,
  canUndo: false,
  canRedo: false,
}

const historyButtons: ToolbarButtonConfig[] = [
  {
    labelKey: 'shared.textEditor.undo',
    Icon: Undo,
    isEnabled: (state) => state.canUndo,
    onClick: (editor) => editor.chain().focus().undo().run(),
  },
  {
    labelKey: 'shared.textEditor.redo',
    Icon: Redo,
    isEnabled: (state) => state.canRedo,
    onClick: (editor) => editor.chain().focus().redo().run(),
  },
]

const inlineFormattingButtons: ToolbarButtonConfig[] = [
  {
    labelKey: 'shared.textEditor.bold',
    Icon: Bold,
    active: (editor) => Boolean(editor?.isActive('bold')),
    onClick: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    labelKey: 'shared.textEditor.italic',
    Icon: Italic,
    active: (editor) => Boolean(editor?.isActive('italic')),
    onClick: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    labelKey: 'shared.textEditor.underline',
    Icon: UnderlineIcon,
    active: (editor) => Boolean(editor?.isActive('underline')),
    onClick: (editor) => editor.chain().focus().toggleUnderline().run(),
  },
  {
    labelKey: 'shared.textEditor.strikethrough',
    Icon: Strikethrough,
    active: (editor) => Boolean(editor?.isActive('strike')),
    onClick: (editor) => editor.chain().focus().toggleStrike().run(),
  },
  {
    labelKey: 'shared.textEditor.inlineCode',
    Icon: Code,
    active: (editor) => Boolean(editor?.isActive('code')),
    onClick: (editor) => editor.chain().focus().toggleCode().run(),
  },
  {
    labelKey: 'shared.textEditor.link',
    Icon: Link2,
    active: (editor) => Boolean(editor?.isActive('link')),
    onClick: toggleLink,
  },
  {
    labelKey: 'shared.textEditor.clearFormatting',
    Icon: RemoveFormatting,
    active: () => false,
    onClick: clearFormatting,
  },
]

const structureButtons: ToolbarButtonConfig[] = [
  {
    labelKey: 'shared.textEditor.heading1',
    Icon: Heading1,
    textLabel: 'H1',
    active: (editor) => Boolean(editor?.isActive('heading', { level: 1 })),
    onClick: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    labelKey: 'shared.textEditor.heading2',
    Icon: Heading2,
    textLabel: 'H2',
    active: (editor) => Boolean(editor?.isActive('heading', { level: 2 })),
    onClick: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    labelKey: 'shared.textEditor.heading3',
    Icon: Heading3,
    textLabel: 'H3',
    active: (editor) => Boolean(editor?.isActive('heading', { level: 3 })),
    onClick: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    labelKey: 'shared.textEditor.bulletList',
    Icon: List,
    active: (editor) => Boolean(editor?.isActive('bulletList')),
    onClick: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    labelKey: 'shared.textEditor.orderedList',
    Icon: ListOrdered,
    active: (editor) => Boolean(editor?.isActive('orderedList')),
    onClick: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    labelKey: 'shared.textEditor.blockquote',
    Icon: Quote,
    active: (editor) => Boolean(editor?.isActive('blockquote')),
    onClick: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    labelKey: 'shared.textEditor.codeBlock',
    Icon: FileCode,
    active: (editor) => Boolean(editor?.isActive('codeBlock')),
    onClick: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
]

/** Shared markdown editor toolbar configuration and actions. */
export const markdownEditorToolbarConfig = {
  defaultToolbarState,
  historyButtons,
  inlineFormattingButtons,
  structureButtons,
  buildToolbarState(currentEditor: Editor | null): ToolbarState {
    if (!currentEditor) {
      return defaultToolbarState
    }

    return {
      isBold: currentEditor.isActive('bold'),
      isItalic: currentEditor.isActive('italic'),
      isUnderline: currentEditor.isActive('underline'),
      isStrike: currentEditor.isActive('strike'),
      isInlineCode: currentEditor.isActive('code'),
      isLink: currentEditor.isActive('link'),
      isHeading1: currentEditor.isActive('heading', { level: 1 }),
      isHeading2: currentEditor.isActive('heading', { level: 2 }),
      isHeading3: currentEditor.isActive('heading', { level: 3 }),
      isBulletList: currentEditor.isActive('bulletList'),
      isOrderedList: currentEditor.isActive('orderedList'),
      isBlockquote: currentEditor.isActive('blockquote'),
      isCodeBlock: currentEditor.isActive('codeBlock'),
      canUndo: currentEditor.can().chain().focus().undo().run(),
      canRedo: currentEditor.can().chain().focus().redo().run(),
    }
  },
  toggleLink(editor: Editor, { linkPrompt }: ToolbarActionContext) {
    toggleLink(editor, { linkPrompt })
  },
  clearFormatting(editor: Editor) {
    clearFormatting(editor)
  },
} as const
