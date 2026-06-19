import { useMemo } from 'react'

import { MarkdownManager } from '@tiptap/markdown'
import { generateHTML } from '@tiptap/react'
import DOMPurify, { type Config } from 'dompurify'

import { cn } from '@/shared/lib/utils'

import { buildStaticMarkdownExtensions, MARKDOWN_CONTENT_CLASSES } from './markdownEditorExtensions'

interface MarkdownContentProps {
  value: string
  className?: string
  editorClassName?: string
}

/**
 * Singleton extension set and `MarkdownManager` for markdown → JSON parsing.
 * Created once at module level to avoid per-render overhead. Uses
 * `buildStaticMarkdownExtensions` (no Placeholder) to keep static HTML clean.
 */
const STATIC_EXTENSIONS = buildStaticMarkdownExtensions()
const markdownManager = new MarkdownManager({ extensions: STATIC_EXTENSIONS })

/** DOMPurify allowlist covering all elements StarterKit + Link + Underline emit. */
const PURIFY_CONFIG: Config = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    's',
    'del',
    'a',
    'ul',
    'ol',
    'li',
    'blockquote',
    'pre',
    'code',
    'h1',
    'h2',
    'h3',
    'hr',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
}

/**
 * Read-only markdown renderer. Converts a markdown string to static HTML using
 * Tiptap's `generateHTML` utility — no live editor instance is mounted.
 *
 * This avoids the a11y issues (`role="textbox"`, `aria-multiline`) and the
 * per-row performance cost of mounting a full Tiptap editor in list views.
 * Generated HTML is sanitized with DOMPurify before injection.
 *
 * @param props - Component props.
 * @param props.value - Markdown string to render.
 * @param props.className - Optional class applied to the outer wrapper div.
 * @param props.editorClassName - Optional class applied to the inner content
 *   div, using the same typography tokens as the live editor surface.
 * @returns Static HTML rendering of the markdown content.
 */
export function MarkdownContent({ value, className, editorClassName }: MarkdownContentProps) {
  const html = useMemo(() => {
    if (!value) return ''
    try {
      const doc = markdownManager.parse(value)
      const raw = generateHTML(doc, STATIC_EXTENSIONS)
      return DOMPurify.sanitize(raw, PURIFY_CONFIG)
    } catch {
      return ''
    }
  }, [value])

  return (
    <div className={className}>
      <div
        className={cn('w-full text-sm leading-[1.65]', MARKDOWN_CONTENT_CLASSES, editorClassName)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
