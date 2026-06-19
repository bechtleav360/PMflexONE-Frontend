import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import type { Project, ProjectFormValues, ProjectSizeClassification } from '@/entities/project'
import { projectFormSchema } from '@/entities/project'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'

import { useEditProjectStore } from '../store/editProjectStore'
import { updateWithToast, useEditProject } from './useEditProject'

/**
 * Parses an ISO 8601 date string (YYYY-MM-DD) into a local-timezone Date.
 * Appending the time component forces the JS Date constructor to treat the
 * string as local time rather than midnight UTC.
 *
 * @param dateStr - ISO 8601 date string or `null`.
 * @returns A `Date` in local time, or `undefined` if `dateStr` is falsy.
 */
function parseLocalDate(dateStr: string | null): Date | undefined {
  if (!dateStr) return undefined
  return new Date(`${dateStr}T00:00:00`)
}

function buildDefaultValues(project: Project | null | undefined): ProjectFormValues {
  if (!project) {
    return {
      name: '',
      sizeClassification: '' as ProjectSizeClassification,
      startDate: undefined as unknown as Date,
      endDate: undefined as unknown as Date,
      description: '',
    }
  }
  return {
    name: project.name,
    sizeClassification: project.sizeClassification ?? ('' as ProjectSizeClassification),
    startDate: parseLocalDate(project.startDate) as Date,
    endDate: parseLocalDate(project.endDate) as Date,
    description: project.description ?? '',
  }
}

/**
 * Encapsulates all React Hook Form state and submission logic for the
 * edit-project form. Keeps `EditProjectForm` focused on rendering only.
 *
 * The Dialog unmounts and remounts `EditProjectForm` each time it opens, and
 * the project is already set in the store before the modal renders. Initialising
 * `defaultValues` directly from the store avoids the timing issue that occurs
 * when using `form.reset()` in an effect — Select components miss updates that
 * arrive after their first render.
 *
 * @returns The RHF `form` instance, the mutation pending flag, and the submit handler.
 */
export function useEditProjectForm() {
  const { t } = useTranslation()
  const project = useEditProjectStore((s) => s.payload)
  const { mutateAsync, isPending } = useEditProject()

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: buildDefaultValues(project),
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
    updateWithToast(mutateAsync, values, {
      loading: t('features.editProject.toast.loading'),
      success: t('features.editProject.toast.success'),
      error: (err) => getGraphQLErrorMessage(err, t('features.editProject.toast.error')),
    })
  }

  return { form, isPending, onSubmit }
}
