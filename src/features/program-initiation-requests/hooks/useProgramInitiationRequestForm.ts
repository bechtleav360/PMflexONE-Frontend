import { useRef } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'

import {
  draftSchema,
  submitSchema,
  type ProgramInitiationRequestFormValues,
} from '../utils/programInitiationRequestSchema'

/**
 * Manages React Hook Form state for the program initiation request form.
 * Uses a dual-schema resolver: switches between {@link draftSchema} and
 * {@link submitSchema} based on `actionRef.current`.
 *
 * @param defaultValues - Pre-populated field values for edit/view mode.
 * @returns RHF form methods plus `actionRef` controlling which validation schema is active.
 */
export function useProgramInitiationRequestForm(
  defaultValues?: Partial<ProgramInitiationRequestFormValues>,
) {
  const actionRef = useRef<'draft' | 'submit'>('draft')

  const form = useForm<ProgramInitiationRequestFormValues>({
    resolver: (values, context, options) => {
      const schema = actionRef.current === 'submit' ? submitSchema : draftSchema
      return (zodResolver(schema) as Resolver<ProgramInitiationRequestFormValues>)(
        values,
        context,
        options,
      )
    },
    defaultValues: {
      name: '',
      documentVersion: '',
      requestingProgramId: '',
      portfolioId: '',
      projectInitiator: null,
      projectOwner: null,
      organizationalUnit: null,
      solutionProvider: null,
      approvalAuthority: null,
      requestDate: null,
      estimatedEffort: null,
      estimatedEffortComment: '',
      targetDeliveryDate: null,
      deliveryType: null,
      ...defaultValues,
    },
  })

  return { ...form, actionRef }
}
