import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import { FormFieldContext } from './formContext'

/**
 * Connects a single React Hook Form field to its label, control, and message.
 * Provides field name context to nested `FormItem`, `FormLabel`, and
 * `FormMessage` components.
 *
 * @param props - Passes all `Controller` props through to RHF.
 * @returns A form field with injected context.
 */
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}
