import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

/** Controls the layout mode of the page content area. */
type PageContentVariant = 'default' | 'full-height' | 'scrollable'

const VARIANT_CLASSES: Record<PageContentVariant, string> = {
  default: 'mx-auto max-w-5xl min-w-[40rem] px-xl py-3xl',
  'full-height': 'mx-auto flex h-full max-w-5xl min-w-[40rem] flex-col overflow-hidden p-6',
  scrollable: 'flex flex-col p-6',
}

interface PageContentProps {
  children: ReactNode
  /** @default 'default' */
  variant?: PageContentVariant
  className?: string
}

/**
 * Standard page content wrapper that renders the page-level `<main>` landmark.
 * Horizontal centering and max/min-width are applied by the parent
 * {@link Layout} component — pages must not redeclare them here.
 *
 * - `variant="default"` — standard padding (`px-xl py-3xl`). Use for content,
 *   form, and detail pages where the outer Layout scroll container handles scrolling.
 * - `variant="full-height"` — full-height flex column (`flex h-full flex-col
 *   overflow-hidden p-6`). Use for data table pages where only the table body
 *   scrolls and the toolbar and pagination must remain fixed.
 * - `variant="scrollable"` — flex column without overflow clipping (`flex flex-col p-6`).
 *   Use for tree/list pages where content grows naturally and the outer page scroll
 *   container handles overflow rather than an inner scrollable box.
 *
 * Pass `className` to add further constraints, e.g. `max-w-3xl` for narrow layouts.
 * @param props - Component props.
 * @param props.children - Page content to render inside the main landmark.
 * @param props.variant - Layout mode. Defaults to `'default'`.
 * @param props.className - Optional extra classes, e.g. `max-w-3xl` for narrow layouts.
 * @returns The page content element.
 */
export function PageContent({ children, variant = 'default', className }: PageContentProps) {
  return <main className={cn(VARIANT_CLASSES[variant], className)}>{children}</main>
}
