/* eslint-disable react/jsx-no-literals -- showcase demo content uses hardcoded strings intentionally */
import { useTranslation } from 'react-i18next'

import { MatrixTable } from '@/shared/components/MatrixTable'

import { SampleRow } from './SampleRow'
import { ShowcaseSection } from './ShowcaseSection'

const ROLE_COL_CLASS = 'min-w-[60px] border px-3 py-2 text-center text-xs font-semibold'
const GROUP_HEADER_CLASS =
  'text-muted-foreground border px-2 py-1 text-center text-xs font-semibold'

/**
 * Showcase section for the MatrixTable component.
 * Demonstrates two-level column headers (role groups + role columns)
 * with sample RASCI task rows.
 * @returns A section with a sample MatrixTable.
 */
export function MatrixTableSection() {
  const { t } = useTranslation()

  return (
    <ShowcaseSection
      title={t('showcase.matrixTable.title')}
      titleId="matrix-table-showcase-heading"
    >
      <MatrixTable
        className="max-h-72 rounded-md border"
        aria-labelledby="matrix-table-showcase-heading"
      >
        <thead>
          <tr>
            <th
              scope="col"
              aria-label={t('showcase.matrixTable.taskColumn')}
              className="bg-background sticky left-0 z-10 border px-3 py-2"
              rowSpan={2}
            />
            <th
              scope="colgroup"
              colSpan={2}
              className={GROUP_HEADER_CLASS}
            >
              Management
            </th>
            <th
              scope="colgroup"
              colSpan={2}
              className={GROUP_HEADER_CLASS}
            >
              Execution
            </th>
          </tr>
          <tr>
            {['PM', 'SP', 'DEV', 'QA'].map((role) => (
              <th
                key={role}
                scope="col"
                className={ROLE_COL_CLASS}
              >
                {role}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <SampleRow
            label="Planning"
            values={['A', 'R', 'C', 'I']}
          />
          <SampleRow
            label="Development"
            values={['I', 'A', 'R', 'S']}
          />
          <SampleRow
            label="Testing"
            values={['I', 'C', 'S', '—']}
          />
        </tbody>
      </MatrixTable>
    </ShowcaseSection>
  )
}
