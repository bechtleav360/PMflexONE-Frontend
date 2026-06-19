import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { listProjectsQueryKey } from '@/entities/project'
import type { ProjectFormValues } from '@/entities/project'
import { formatLocalDate } from '@/shared/components'
import { withToast } from '@/shared/lib'

import { createProject } from '../api/createProjectApi'
import { useCreateProjectStore } from '../store/createProjectStore'
import type { CreateProjectInput } from '../types/createProject.types'

/**
 * Converts raw `ProjectFormValues` to the `CreateProjectInput` shape
 * expected by the GraphQL mutation. Dates are serialised to ISO 8601 date
 * strings (YYYY-MM-DD). Empty description is omitted from the payload.
 *
 * @param values - Validated form values from React Hook Form.
 * @returns The mutation input ready to dispatch.
 */
function toMutationInput(values: ProjectFormValues): CreateProjectInput {
  const input: CreateProjectInput = {
    name: values.name.trim(),
    sizeClassification: values.sizeClassification,
    startDate: formatLocalDate(values.startDate),
    endDate: formatLocalDate(values.endDate),
  }

  if (values.description) {
    input.description = values.description
  }

  return input
}

/**
 * TanStack mutation hook for creating a new project.
 *
 * On success: closes the modal, invalidates the `listProjects` cache so the
 * new project appears immediately, and navigates the user to `/projects`.
 *
 * On error: the toast resolves to an error state; the modal stays open and
 * the form data is preserved so the user can retry.
 *
 * @returns A TanStack `useMutation` result.
 */
export function useCreateProject() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const closeModal = useCreateProjectStore((s) => s.closeModal)

  return useMutation({
    mutationFn: (values: ProjectFormValues) => createProject(toMutationInput(values)),
    onSuccess: async () => {
      closeModal()
      await queryClient.invalidateQueries({ queryKey: listProjectsQueryKey })
      navigate('/projects')
    },
  })
}

/**
 * Wraps `useCreateProject` mutation inside a Promise Toast.
 * Call this from `CreateProjectForm` submit handler.
 *
 * Uses `mutateAsync` so the promise resolves/rejects independently of the
 * component lifecycle — per-call `mutate` callbacks are dropped when the modal
 * unmounts on success, which would leave the toast stuck in loading state.
 *
 * @param mutateAsync - The `mutateAsync` function returned by `useCreateProject`.
 * @param values - The validated form values.
 * @param messages - Toast text for loading, success, and error states.
 * @param messages.loading - Text shown while the mutation is in-flight.
 * @param messages.success - Text shown on successful project creation.
 * @param messages.error - Text shown when the mutation fails.
 */
export function submitWithToast(
  mutateAsync: ReturnType<typeof useCreateProject>['mutateAsync'],
  values: ProjectFormValues,
  messages: { loading: string; success: string; error: string | ((err: unknown) => string) },
) {
  withToast(mutateAsync, values, messages)
}
