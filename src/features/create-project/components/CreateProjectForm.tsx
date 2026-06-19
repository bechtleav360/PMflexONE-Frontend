import { ProjectForm } from '@/entities/project'

import { useCreateProjectForm } from '../hooks/useCreateProjectForm'

interface CreateProjectFormProps {
  /** Called when the user clicks the Cancel button. */
  onCancel?: () => void
}

/**
 * React Hook Form–powered project creation form.
 *
 * Wires `useCreateProjectForm` to the shared `ProjectForm` component.
 * Form state, validation, and submission logic live in `useCreateProjectForm`.
 *
 * @param props - Component props.
 * @param props.onCancel - Optional callback invoked when the user cancels.
 * @returns The create-project form.
 */
export function CreateProjectForm({ onCancel }: CreateProjectFormProps = {}) {
  const { form, isPending, onSubmit } = useCreateProjectForm()

  return (
    <ProjectForm
      form={form}
      isPending={isPending}
      onSubmit={form.handleSubmit(onSubmit)}
      onCancel={onCancel}
      i18nKeys={{
        nameLabel: 'features.createProject.fields.name',
        namePlaceholder: 'features.createProject.fields.namePlaceholder',
        sizeClassificationLabel: 'features.createProject.fields.sizeClassification',
        sizeClassificationPlaceholder:
          'features.createProject.fields.sizeClassificationPlaceholder',
        sizeSmall: 'features.createProject.sizeClassification.small',
        sizeMedium: 'features.createProject.sizeClassification.medium',
        sizeLarge: 'features.createProject.sizeClassification.large',
        startDateLabel: 'features.createProject.fields.startDate',
        endDateLabel: 'features.createProject.fields.endDate',
        descriptionLabel: 'features.createProject.fields.description',
        descriptionPlaceholder: 'features.createProject.fields.descriptionPlaceholder',
        cancel: 'features.createProject.cancel',
        submit: 'features.createProject.submit',
      }}
    />
  )
}
