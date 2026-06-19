import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Separator } from '@/shared/components'

import type { ProgramProjectEdge } from '../types/program.types'

/**
 * Renders the projects section of the program detail page.
 *
 * @param root0 - Component props.
 * @param root0.projects - List of project edges; renders nothing when empty or undefined.
 * @returns The projects list section, or null if there are no projects.
 */
export function ProgramProjectsList({ projects }: { projects?: ProgramProjectEdge[] }) {
  const { t } = useTranslation()

  if (!projects || projects.length === 0) return null

  return (
    <>
      <Separator className="my-6" />
      <div>
        <h2 className="mb-4 text-lg font-semibold">{t('pages.programs.detail.projects.title')}</h2>
        <ul className="flex flex-col gap-2">
          {projects.map((edge) => (
            <li
              key={edge.item.id}
              className="text-sm"
            >
              <Link
                to={`/projects/${edge.item.id}`}
                className="hover:underline focus:underline"
              >
                {edge.item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
