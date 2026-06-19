import { Card } from '@/shared/components/Card'
import { Table } from '@/shared/components/Table'
import type { TableProps } from '@/shared/components/Table'

/**
 * Props for the ListView component. Extends all TableProps\<T\> and adds an optional Card wrapper className.
 */
export interface ListViewProps<T> extends TableProps<T> {
  /** className forwarded to the Card wrapper. */
  cardClassName?: string
}

/**
 * Renders a shared Table inside a Card wrapper.
 *
 * Drop-in replacement for the `<Card><Table /></Card>` pattern used across
 * list pages. All TableProps are forwarded to the inner Table unchanged;
 * cardClassName is applied to the surrounding Card.
 *
 * @template T - Row shape rendered by the table.
 * @param props - Component props.
 * @returns The rendered list view.
 */
export function ListView<T>({ cardClassName, ...tableProps }: ListViewProps<T>) {
  return (
    <Card className={cardClassName}>
      <Table {...tableProps} />
    </Card>
  )
}
