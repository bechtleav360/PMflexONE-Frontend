import * as React from 'react'

import type { FieldPath, FieldValues } from 'react-hook-form'

/** Context value carried by FormField — exposes the registered field name. */
export interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName
}

/** React context that passes field name from FormField down to its descendants. */
export const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
)

/** Context value carried by FormItem — exposes the generated element id. */
export interface FormItemContextValue {
  id: string
}

/** React context that passes the generated id from FormItem down to its descendants. */
export const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue)
