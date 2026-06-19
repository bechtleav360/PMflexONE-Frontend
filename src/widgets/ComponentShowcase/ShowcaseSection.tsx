import type { ReactNode } from 'react'

interface ShowcaseSectionProps {
  title: string
  titleId?: string
  children: ReactNode
}

/**
 * Labelled wrapper for a group of showcased components.
 * @param props - Component props.
 * @param props.title - Section heading rendered as an `<h2>`.
 * @param props.titleId - Optional id applied to the heading for aria-labelledby relationships.
 * @param props.children - Component examples displayed in a wrapping flex row.
 * @returns A `<section>` element with a heading and a flex container.
 */
export function ShowcaseSection({ title, titleId, children }: ShowcaseSectionProps) {
  return (
    <section className="space-y-lg">
      <h2
        id={titleId}
        className="text-xl font-semibold tracking-tight"
      >
        {title}
      </h2>
      <div className="gap-md flex flex-wrap items-start">{children}</div>
    </section>
  )
}
