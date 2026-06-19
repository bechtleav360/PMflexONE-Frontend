import { render, screen } from '@testing-library/react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { beforeAll, describe, expect, it } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import type { BoardFormValues } from '../../utils/boardFormSchema'
import { DEFAULT_BOARD_COLUMNS } from '../../utils/boardFormSchema'
import { BoardColumnFields } from './BoardColumnFields'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

// ── wrapper that wires up react-hook-form ─────────────────────────────────────

function Wrapper({
  isPending = false,
  initialColumns = DEFAULT_BOARD_COLUMNS,
}: {
  isPending?: boolean
  initialColumns?: BoardFormValues['columns']
}) {
  const methods = useForm<BoardFormValues>({
    defaultValues: { name: 'My Board', columns: initialColumns },
  })
  const { fields } = useFieldArray({ control: methods.control, name: 'columns' })

  return (
    <FormProvider {...methods}>
      <BoardColumnFields
        fields={fields}
        control={methods.control}
        isPending={isPending}
        errors={methods.formState.errors}
      />
    </FormProvider>
  )
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('BoardColumnFields', () => {
  it('renders the "Default Columns" heading', () => {
    render(<Wrapper />)
    expect(screen.getByText('Default Columns')).toBeInTheDocument()
  })

  it('renders one input per column', () => {
    render(<Wrapper />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(DEFAULT_BOARD_COLUMNS.length)
  })

  it('pre-fills input values with the column names', () => {
    render(<Wrapper />)
    expect(screen.getByDisplayValue('Open')).toBeInTheDocument()
    expect(screen.getByDisplayValue('In Progress')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Done')).toBeInTheDocument()
  })

  it('shows the workItemStatus badge next to each column input', () => {
    render(<Wrapper />)
    expect(screen.getByText('OPEN')).toBeInTheDocument()
    expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument()
    expect(screen.getByText('DONE')).toBeInTheDocument()
  })

  it('disables all inputs when isPending is true', () => {
    render(<Wrapper isPending />)
    const inputs = screen.getAllByRole('textbox')
    inputs.forEach((input) => expect(input).toBeDisabled())
  })

  it('renders with a custom set of columns', () => {
    render(<Wrapper initialColumns={[{ name: 'Backlog', workItemStatus: 'OPEN', position: 0 }]} />)
    expect(screen.getByDisplayValue('Backlog')).toBeInTheDocument()
  })

  it('renders empty state without crashing when fields array is empty', () => {
    render(<Wrapper initialColumns={[]} />)
    expect(screen.getByText('Default Columns')).toBeInTheDocument()
    expect(screen.queryAllByRole('textbox')).toHaveLength(0)
  })
})
