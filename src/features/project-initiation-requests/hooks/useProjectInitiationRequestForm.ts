import { useRef } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'

import { formatLocalDate } from '@/shared/components'

import {
  draftSchema,
  submitSchema,
  type ProjectInitiationRequestFormValues,
} from '../utils/projectInitiationRequestSchema'

/**
 * Manages React Hook Form state for the project initiation request form.
 *
 * Uses a dual-schema resolver: switches between {@link draftSchema} and
 * {@link submitSchema} based on `actionRef.current`, which the caller sets
 * synchronously before triggering submission.
 *
 * @param defaultValues - Pre-populated field values for edit/view mode.
 * @returns RHF form methods plus `actionRef` controlling which validation schema is active.
 */
export function useProjectInitiationRequestForm(
  defaultValues?: Partial<ProjectInitiationRequestFormValues>,
) {
  const actionRef = useRef<'draft' | 'submit'>('draft')

  const form = useForm<ProjectInitiationRequestFormValues>({
    resolver: (values, context, options) => {
      const schema = actionRef.current === 'submit' ? submitSchema : draftSchema
      // zodResolver types against the schema's input shape (optional fields), but the form uses
      // the output shape (defaults applied). Cast is safe — both schemas are structurally compatible.
      return (zodResolver(schema) as Resolver<ProjectInitiationRequestFormValues>)(
        values,
        context,
        options,
      )
    },
    defaultValues: {
      name: '',
      documentVersion: '',
      requestingProjectId: '',
      scopeType: undefined,
      scopeId: '',
      projectInitiator: null,
      projectOwner: null,
      organizationalUnit: null,
      solutionProvider: null,
      approvalAuthority: null,
      requestDate: formatLocalDate(new Date()),
      estimatedEffort: null,
      estimatedEffortComment: '',
      targetDeliveryDate: null,
      deliveryType: null,
      ...defaultValues,
    },
  })

  return { ...form, actionRef }
}
