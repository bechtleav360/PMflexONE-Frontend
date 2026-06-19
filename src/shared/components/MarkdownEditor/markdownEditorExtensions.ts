import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'

/**
 * Shared markdown typography classes applied to both the live editor surface
 * and the static read-only renderer. Extract here so both stay visually
 * identical when design tokens or element styles change.
 */
export const MARKDOWN_CONTENT_CLASSES =
  '[&_p]:mb-2 [&_p:last-child]:mb-0 ' +
  '[&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-bold ' +
  '[&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold ' +
  '[&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-bold ' +
  '[&_blockquote]:border-primary [&_blockquote]:border-l-[3px] [&_blockquote]:my-[6px] [&_blockquote]:py-[2px] [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_blockquote]:italic ' +
  '[&_ul]:list-disc [&_ul]:pl-[18px] [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-[18px] [&_ol]:mb-2 ' +
  '[&_li]:my-[3px] ' +
  '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 ' +
  '[&_code]:font-mono [&_code]:text-xs [&_code]:bg-muted [&_code]:border [&_code]:border-border [&_code]:rounded [&_code]:px-[5px] [&_code]:py-[1px] [&_code]:text-primary ' +
  '[&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:border [&_pre]:border-border [&_pre]:py-[10px] [&_pre]:px-3 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:my-[6px] [&_pre]:leading-[1.5] ' +
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit [&_pre_code]:border-0 ' +
  '[&_hr]:my-lg [&_hr]:border-border'

function buildBaseExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      link: false,
      underline: false,
    }),
    Underline,
    Link.configure({
      autolink: true,
      linkOnPaste: true,
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-primary underline underline-offset-4',
        rel: 'noreferrer noopener nofollow',
        target: '_blank',
      },
    }),
    Markdown.configure({ markedOptions: { gfm: true } }),
  ]
}

/**
 * Builds the Tiptap extension set for the static read-only renderer.
 *
 * Excludes `Placeholder`, which is an editor-only plugin that emits
 * `data-placeholder` attributes and decorations irrelevant to static HTML.
 *
 * @returns Array of configured Tiptap extensions for static rendering.
 */
export function buildStaticMarkdownExtensions() {
  return buildBaseExtensions()
}

/**
 * Builds the canonical Tiptap extension set for the live markdown editor.
 *
 * Accepts `placeholder` as a factory function so callers can pass a ref-backed
 * `() => ref.current` without recreating the extensions array when the
 * placeholder string changes — which would reset ProseMirror plugin state
 * (including undo history).
 *
 * @param placeholder - Static placeholder text or a function returning the
 *   current placeholder string. The Placeholder extension reads this on every
 *   decoration pass, so a ref-backed function stays current without causing
 *   an extension rebuild.
 * @returns Array of configured Tiptap extensions.
 */
export function buildMarkdownEditorExtensions(placeholder: string | (() => string)) {
  return [...buildBaseExtensions(), Placeholder.configure({ placeholder })]
}
