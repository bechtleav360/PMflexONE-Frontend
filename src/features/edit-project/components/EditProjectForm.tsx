import { ProjectForm } from '@/entities/project'

import { useEditProjectForm } from '../hooks/useEditProjectForm'

interface EditProjectFormProps {
  /** Called when the user clicks the Cancel button. */
  onCancel?: () => void
}

/**
 * React Hook Form–powered project editing form.
 *
 * Pre-populated with the current project's values from `useEditProjectStore`.
 * Wires `useEditProjectForm` to the shared `ProjectForm` component.
 * Form state, validation, and submission logic live in `useEditProjectForm`.
 *
 * @param props - Component props.
 * @param props.onCancel - Optional callback invoked when the user cancels.
 * @returns The edit-project form.
 */
export function EditProjectForm({ onCancel }: EditProjectFormProps = {}) {
  const { form, isPending, onSubmit } = useEditProjectForm()

  return (
    <ProjectForm
      form={form}
      isPending={isPending}
      onSubmit={form.handleSubmit(onSubmit)}
      onCancel={onCancel}
      i18nKeys={{
        nameLabel: 'features.editProject.fields.name',
        namePlaceholder: 'features.editProject.fields.namePlaceholder',
        sizeClassificationLabel: 'features.editProject.fields.sizeClassification',
        sizeClassificationPlaceholder: 'features.editProject.fields.sizeClassificationPlaceholder',
        sizeSmall: 'features.editProject.sizeClassification.small',
        sizeMedium: 'features.editProject.sizeClassification.medium',
        sizeLarge: 'features.editProject.sizeClassification.large',
        startDateLabel: 'features.editProject.fields.startDate',
        endDateLabel: 'features.editProject.fields.endDate',
        descriptionLabel: 'features.editProject.fields.description',
        descriptionPlaceholder: 'features.editProject.fields.descriptionPlaceholder',
        cancel: 'features.editProject.cancel',
        submit: 'features.editProject.submit',
      }}
    />
  )
}
