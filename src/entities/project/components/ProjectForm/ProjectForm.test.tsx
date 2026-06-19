import { createElement } from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import type { ProjectFormValues } from '../../types/projectForm.types'
import { ProjectForm } from './ProjectForm'
import type { ProjectFormI18nKeys } from './ProjectForm'

const I18N_KEYS: ProjectFormI18nKeys = {
  nameLabel: 'features.createProject.fields.name',
  namePlaceholder: 'features.createProject.fields.namePlaceholder',
  sizeClassificationLabel: 'features.createProject.fields.sizeClassification',
  sizeClassificationPlaceholder: 'features.createProject.fields.sizeClassificationPlaceholder',
  sizeSmall: 'features.createProject.sizeClassification.small',
  sizeMedium: 'features.createProject.sizeClassification.medium',
  sizeLarge: 'features.createProject.sizeClassification.large',
  startDateLabel: 'features.createProject.fields.startDate',
  endDateLabel: 'features.createProject.fields.endDate',
  descriptionLabel: 'features.createProject.fields.description',
  descriptionPlaceholder: 'features.createProject.fields.descriptionPlaceholder',
  cancel: 'features.createProject.cancel',
  submit: 'features.createProject.submit',
}

function Fixture({
  defaultValues,
  onCancel,
}: {
  defaultValues?: Partial<ProjectFormValues>
  onCancel?: () => void
}) {
  const form = useForm<ProjectFormValues>({ defaultValues })
  return createElement(ProjectForm, {
    form,
    isPending: false,
    onSubmit: (e) => e.preventDefault(),
    onCancel,
    i18nKeys: I18N_KEYS,
  })
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('ProjectForm', () => {
  it('renders the description editor with a pre-filled value', async () => {
    render(
      createElement(Fixture, {
        defaultValues: { description: 'Existing project description' },
      }),
    )

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /project description/i })).toBeInTheDocument()
    })
  })

  it('calls onCancel when the cancel button is clicked', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()

    render(createElement(Fixture, { onCancel }))

    await waitFor(() => screen.getByRole('button', { name: /cancel/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onCancel).toHaveBeenCalledOnce()
  })
})
