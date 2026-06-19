import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import type { ProjectFormValues, ProjectSizeClassification } from '@/entities/project'
import { projectFormSchema } from '@/entities/project'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'

import { submitWithToast, useCreateProject } from './useCreateProject'

/**
 * Encapsulates all React Hook Form state and submission logic for the
 * create-project form. Keeps `CreateProjectForm` focused on rendering only.
 *
 * @returns The RHF `form` instance, the mutation pending flag, and the submit handler.
 */
export function useCreateProjectForm() {
  const { t } = useTranslation()
  const { mutateAsync, isPending } = useCreateProject()

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      sizeClassification: '' as ProjectSizeClassification,
      startDate: undefined as unknown as Date,
      endDate: undefined as unknown as Date,
      description: '',
    },
  })

  const startDateValue = useWatch({ control: form.control, name: 'startDate' })

  // Clear endDate when startDate is moved to a date after the current endDate
  useEffect(() => {
    const endDate = form.getValues('endDate')
    if (startDateValue && endDate && startDateValue > endDate) {
      form.setValue('endDate', undefined as unknown as Date, { shouldValidate: false })
    }
  }, [startDateValue, form])

  function onSubmit(values: ProjectFormValues) {
    submitWithToast(mutateAsync, values, {
      loading: t('features.createProject.toast.loading'),
      success: t('features.createProject.toast.success'),
      error: (err) => getGraphQLErrorMessage(err, t('features.createProject.toast.error')),
    })
  }

  return { form, isPending, onSubmit }
}
