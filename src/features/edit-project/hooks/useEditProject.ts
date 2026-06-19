import { useMutation, useQueryClient } from '@tanstack/react-query'

import { listProjectsQueryKey } from '@/entities/project'
import type { ProjectFormValues } from '@/entities/project'
import { formatLocalDate } from '@/shared/components'
import { withToast } from '@/shared/lib'

import { updateProject } from '../api/editProjectApi'
import { useEditProjectStore } from '../store/editProjectStore'
import type { UpdateProjectInput } from '../types/editProject.types'

/**
 * Converts raw `ProjectFormValues` to the `UpdateProjectInput` shape
 * expected by the GraphQL mutation. Dates are serialised to ISO 8601 date
 * strings (YYYY-MM-DD). Empty description is omitted from the payload.
 *
 * @param values - Validated form values from React Hook Form.
 * @param version - Optimistic-locking version counter from the project being edited.
 * @returns The mutation input ready to dispatch.
 */
function toMutationInput(values: ProjectFormValues, version: number): UpdateProjectInput {
  const input: UpdateProjectInput = {
    name: values.name.trim(),
    sizeClassification: values.sizeClassification,
    startDate: formatLocalDate(values.startDate),
    endDate: formatLocalDate(values.endDate),
    version,
  }

  if (values.description) {
    input.description = values.description
  }

  return input
}

/**
 * TanStack mutation hook for updating an existing project.
 *
 * On success: closes the modal, invalidates the `listProjects` cache so the
 * updated project reflects immediately.
 *
 * On error: the toast resolves to an error state; the modal stays open and
 * the form data is preserved so the user can retry.
 *
 * @returns A TanStack `useMutation` result.
 */
export function useEditProject() {
  const queryClient = useQueryClient()
  const closeModal = useEditProjectStore((s) => s.closeModal)
  const project = useEditProjectStore((s) => s.payload)

  return useMutation({
    mutationFn: (values: ProjectFormValues) =>
      updateProject(project!.id, toMutationInput(values, project!.version)),
    onSuccess: async () => {
      closeModal()
      await queryClient.invalidateQueries({ queryKey: listProjectsQueryKey })
    },
  })
}

/**
 * Wraps `useEditProject` mutation inside a Promise Toast.
 * Call this from `EditProjectForm` submit handler.
 *
 * Uses `mutateAsync` so the promise resolves/rejects independently of the
 * component lifecycle — per-call `mutate` callbacks are dropped when the modal
 * unmounts on success, which would leave the toast stuck in loading state.
 *
 * @param mutateAsync - The `mutateAsync` function returned by `useEditProject`.
 * @param values - The validated form values.
 * @param messages - Toast text for loading, success, and error states.
 * @param messages.loading - Text shown while the mutation is in-flight.
 * @param messages.success - Text shown on successful project update.
 * @param messages.error - Text shown when the mutation fails.
 */
export function updateWithToast(
  mutateAsync: ReturnType<typeof useEditProject>['mutateAsync'],
  values: ProjectFormValues,
  messages: { loading: string; success: string; error: string | ((err: unknown) => string) },
) {
  withToast(mutateAsync, values, messages)
}
