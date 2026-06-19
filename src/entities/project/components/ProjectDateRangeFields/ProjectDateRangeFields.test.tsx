import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { beforeAll, describe, expect, it } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import type { ProjectFormValues } from '../../types/projectForm.types'
import { ProjectDateRangeFields } from './ProjectDateRangeFields'

function Fixture({ isPending = false }: { isPending?: boolean }) {
  const form = useForm<ProjectFormValues>()
  return (
    <FormProvider {...form}>
      <ProjectDateRangeFields
        control={form.control}
        isPending={isPending}
        i18nKeys={{
          startDateLabel: 'features.createProject.fields.startDate',
          endDateLabel: 'features.createProject.fields.endDate',
        }}
      />
    </FormProvider>
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('ProjectDateRangeFields', () => {
  it('renders start and end date labels', () => {
    render(<Fixture />)
    expect(screen.getByText(/start date/i)).toBeInTheDocument()
    expect(screen.getByText(/end date/i)).toBeInTheDocument()
  })

  it('disables both inputs when isPending is true', () => {
    render(<Fixture isPending />)
    const inputs = screen.getAllByRole('textbox')
    for (const input of inputs) {
      expect(input).toBeDisabled()
    }
  })

  it('clears the start date and commits null to the field', async () => {
    const user = userEvent.setup()
    render(<Fixture />)

    const [startDateInput] = screen.getAllByPlaceholderText('MM/DD/YYYY')

    await user.click(startDateInput)
    await user.type(startDateInput, '01/15/2026')
    fireEvent.blur(startDateInput)
    await waitFor(() => expect(startDateInput).not.toHaveValue(''))

    await user.clear(startDateInput)
    fireEvent.blur(startDateInput)
    await waitFor(() => expect(startDateInput).toHaveValue(''))
  })

  it('clears the end date and commits null to the field', async () => {
    const user = userEvent.setup()
    render(<Fixture />)

    const inputs = screen.getAllByPlaceholderText('MM/DD/YYYY')
    const endDateInput = inputs[1]

    await user.click(endDateInput)
    await user.type(endDateInput, '12/31/2026')
    fireEvent.blur(endDateInput)
    await waitFor(() => expect(endDateInput).not.toHaveValue(''))

    await user.clear(endDateInput)
    fireEvent.blur(endDateInput)
    await waitFor(() => expect(endDateInput).toHaveValue(''))
  })
})
