import { useTranslation } from 'react-i18next'

import type { Program } from '../types/program.types'
import { ProgramStatusBadge } from './ProgramStatusBadge'

const EMPTY = '—'

interface ProgramDetailFieldsProps {
  data: Program
  locale: string
}

/**
 * Renders a definition list of metadata fields for a program detail view.
 * @param root0 - Component props.
 * @param root0.data - The program data to display.
 * @param root0.locale - BCP 47 locale string used to format dates.
 * @returns A definition list of program metadata fields.
 */
export function ProgramDetailFields({ data, locale }: ProgramDetailFieldsProps) {
  const { t } = useTranslation()

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-4">
      <dt className="text-muted-foreground text-sm font-medium">
        {t('pages.programs.detail.fields.status')}
      </dt>
      <dd className="text-sm">
        <ProgramStatusBadge status={data.status} />
      </dd>
      <dt className="text-muted-foreground text-sm font-medium">
        {t('pages.programs.detail.fields.portfolio')}
      </dt>
      <dd className="text-sm">{data.portfolio?.item.name ?? EMPTY}</dd>
      <dt className="text-muted-foreground text-sm font-medium">
        {t('pages.programs.detail.fields.createdAt')}
      </dt>
      <dd className="text-sm">{new Date(data.createdAt).toLocaleDateString(locale)}</dd>
      <dt className="text-muted-foreground text-sm font-medium">
        {t('pages.programs.detail.fields.updatedAt')}
      </dt>
      <dd className="text-sm">{new Date(data.updatedAt).toLocaleDateString(locale)}</dd>
      <dt className="text-muted-foreground text-sm font-medium">
        {t('pages.programs.detail.fields.creator')}
      </dt>
      <dd className="text-sm">
        {data.creator ? `${data.creator.firstName} ${data.creator.lastName}` : EMPTY}
      </dd>
      <dt className="text-muted-foreground text-sm font-medium">
        {t('pages.programs.detail.fields.updater')}
      </dt>
      <dd className="text-sm">
        {data.updater ? `${data.updater.firstName} ${data.updater.lastName}` : EMPTY}
      </dd>
    </dl>
  )
}
