import * as React from 'react'

import { useFormContext } from 'react-hook-form'

import { FormFieldContext, FormItemContext } from './formContext'

/**
 * Returns the field name and the RHF field state for the nearest `FormField`.
 * @returns Field name and its RHF `fieldState`.
 */
export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  return {
    name: fieldContext.name,
    formItemId: itemContext.id,
    formDescriptionId: `${itemContext.id}-description`,
    formMessageId: `${itemContext.id}-message`,
    ...fieldState,
  }
}
