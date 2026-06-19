import { useTranslation } from 'react-i18next'

import type { Project } from '@/entities/project'

const EMPTY = '—'

interface ProjectDetailFieldsProps {
  data: Project
}

/**
 * Renders the project metadata as a definition list.
 * Description is omitted when the project has none.
 *
 * @param props - Component props.
 * @param props.data - The project whose fields are displayed.
 * @returns The project detail definition list element.
 */
export function ProjectDetailFields({ data }: ProjectDetailFieldsProps) {
  const { t } = useTranslation()

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-4">
      {data.description && (
        <>
          <dt className="text-muted-foreground text-sm font-medium">
            {t('pages.projectDetail.fields.description')}
          </dt>
          <dd className="text-sm">{data.description}</dd>
        </>
      )}
      <dt className="text-muted-foreground text-sm font-medium">
        {t('pages.projectDetail.fields.status')}
      </dt>
      <dd className="text-sm">{data.status ?? EMPTY}</dd>
      <dt className="text-muted-foreground text-sm font-medium">
        {t('pages.projectDetail.fields.sizeClassification')}
      </dt>
      <dd className="text-sm">
        {data.sizeClassification
          ? t(`pages.projects.sizeClassification.${data.sizeClassification}`)
          : EMPTY}
      </dd>
      <dt className="text-muted-foreground text-sm font-medium">
        {t('pages.projectDetail.fields.governanceStatus')}
      </dt>
      <dd className="text-sm">
        {data.governanceStatus
          ? t(`pages.projects.governanceStatus.${data.governanceStatus}`)
          : EMPTY}
      </dd>
      <dt className="text-muted-foreground text-sm font-medium">
        {t('pages.projectDetail.fields.startDate')}
      </dt>
      <dd className="text-sm">{data.startDate ?? EMPTY}</dd>
      <dt className="text-muted-foreground text-sm font-medium">
        {t('pages.projectDetail.fields.endDate')}
      </dt>
      <dd className="text-sm">{data.endDate ?? EMPTY}</dd>
    </dl>
  )
}
