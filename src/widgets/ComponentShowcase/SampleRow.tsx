import { RasciValueBadge } from '@/shared/components/RasciValueBadge'
import type { PermissionKey } from '@/shared/lib/rasci'

const CELL_CLASS = 'border px-1 py-1 text-center'
const ROW_HEADER_CLASS =
  'bg-background sticky left-0 z-10 border px-3 py-1 text-left text-sm font-medium'

interface SampleRowProps {
  label: string
  values: PermissionKey[]
}

/**
 * A single data row for the MatrixTable showcase, with a row header and RASCI value cells.
 * @param root0 - Component props.
 * @param root0.label - Row header label.
 * @param root0.values - RASCI permission key values for each cell.
 * @returns The rendered table row element.
 */
export function SampleRow({ label, values }: SampleRowProps) {
  return (
    <tr>
      <th
        scope="row"
        className={ROW_HEADER_CLASS}
      >
        {label}
      </th>
      {values.map((v, i) => (
        <td
          key={i}
          className={CELL_CLASS}
        >
          <RasciValueBadge value={v} />
        </td>
      ))}
    </tr>
  )
}
