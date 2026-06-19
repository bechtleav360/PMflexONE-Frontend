import { useTranslation } from 'react-i18next'

import { Separator } from '@/shared/components'

import type { Program } from '../types/program.types'

/** Props for {@link ProgramMetaSection}. */
interface ProgramMetaSectionProps {
  /** The program whose audit metadata is displayed. */
  program: Program
}

/**
 * Audit metadata panel rendered inside the edit dialog: creator, creation date,
 * last updater, last update date, and an optional project list.
 *
 * @param props - Component props.
 * @param props.program - The program whose audit metadata is displayed.
 * @returns The rendered audit metadata section.
 */
export function ProgramMetaSection({ program }: ProgramMetaSectionProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  return (
    <>
      <Separator />
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {t('pages.programs.editDialog.detail.creator')}
          </span>
          <span>
            {program.creator ? `${program.creator.firstName} ${program.creator.lastName}` : '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {t('pages.programs.editDialog.detail.createdAt')}
          </span>
          <span>{new Date(program.createdAt).toLocaleDateString(locale)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {t('pages.programs.editDialog.detail.updater')}
          </span>
          <span>
            {program.updater ? `${program.updater.firstName} ${program.updater.lastName}` : '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {t('pages.programs.editDialog.detail.updatedAt')}
          </span>
          <span>{new Date(program.updatedAt).toLocaleDateString(locale)}</span>
        </div>
      </div>
      {program.projects !== undefined && (
        <>
          <Separator />
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              {t('pages.programs.editDialog.detail.projects')}
            </span>
            {program.projects.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {t('pages.programs.editDialog.detail.noProjects')}
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {program.projects.map((edge) => (
                  <li
                    key={edge.item.id}
                    className="text-sm"
                  >
                    {edge.item.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </>
  )
}
