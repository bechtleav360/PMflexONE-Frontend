import { useEffect, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, Link2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DatePicker,
  Input,
  Label,
  MarkdownEditor,
} from '@/shared/components'
import { cn } from '@/shared/lib/utils'

import type { ConstraintListItem } from '../../types/constraint.types'
import { formatDateTime, parseLocalDate, toLocalISODate } from '../../utils'
import type { ConstraintFormValues } from '../../utils/constraintSchema'
import { constraintFormSchema } from '../../utils/constraintSchema'
import type { ConstraintLinksSectionHandle } from '../ConstraintLinksSection'
import { ConstraintLinksSection } from '../ConstraintLinksSection'

/** Props for {@link EditConstraintForm}. */
interface EditConstraintFormProps {
  /** The constraint item used to pre-populate the form. */
  constraint: ConstraintListItem
  /** ID of the project scope. */
  scopeId: string
  /** Called with validated form values when the user submits. */
  onSubmit: (values: ConstraintFormValues) => void | Promise<void>
  /** Called after the full save sequence succeeds. */
  onSuccess?: () => void
  /** When true all inputs are disabled and the save button is hidden. */
  readOnly?: boolean
  /** Called whenever the form dirty state changes. */
  onDirtyChange?: (dirty: boolean) => void
}

/**
 * Form for editing an existing project constraint.
 *
 * Pre-populates all fields from the provided `constraint` item. When the
 * time-bound checkbox is unchecked, the deadline field is hidden and `dueDate`
 * is reset to `null`. Displays the linked `projectCharter` as read-only when
 * present (constraint → project charter mutation is deferred, FR-026).
 *
 * @param props - Component props.
 * @param props.constraint - Existing constraint data used as default values.
 * @param props.onSubmit - Submit handler receiving validated form values.
 * @returns The rendered edit form.
 */
// eslint-disable-next-line max-lines-per-function, complexity -- form component; line count scales with number of domain fields, not logic complexity
export function EditConstraintForm({
  constraint,
  scopeId,
  onSubmit,
  onSuccess,
  readOnly = false,
  onDirtyChange,
}: EditConstraintFormProps) {
  const { t, i18n } = useTranslation()
  const linksRef = useRef<ConstraintLinksSectionHandle>(null)
  const [linksDirty, setLinksDirty] = useState(false)
  const [linksOpen, setLinksOpen] = useState(true)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ConstraintFormValues>({
    resolver: zodResolver(constraintFormSchema),
    defaultValues: {
      name: constraint.name,
      description: constraint.description ?? null,
      timeConstrained: constraint.timeConstrained,
      dueDate: constraint.dueDate ?? null,
      otherInformation: constraint.otherInformation ?? null,
      ownerId: constraint.owner?.id ?? null,
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form watch() is subscription-based; memoization would break reactivity
  const timeConstrained = watch('timeConstrained')

  useEffect(() => {
    if (!timeConstrained) {
      setValue('dueDate', null)
    }
  }, [timeConstrained, setValue])

  useEffect(() => {
    onDirtyChange?.(isDirty || linksDirty)
  }, [isDirty, linksDirty, onDirtyChange])

  return (
    <>
      <form
        onSubmit={handleSubmit(async (values) => {
          await linksRef.current?.flush()
          await onSubmit(values)
          onSuccess?.()
        })}
        noValidate
        className="flex flex-col gap-4"
        id="edit-constraint-form"
      >
        <div className="flex flex-col gap-1.5">
          <p className="text-sm leading-none font-medium">
            {t('features.planningObjects.common.createdAt')}
          </p>
          <p className="text-muted-foreground text-sm">
            {formatDateTime(constraint.createdAt, i18n.language)}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-constraint-name">
            {t('features.planningObjects.common.name')}
            <span
              aria-hidden="true"
              className="text-destructive ml-0.5"
            >
              {/* eslint-disable-next-line react/jsx-no-literals -- required-field asterisk is a UI convention, not translatable content */}
              {'*'}
            </span>
          </Label>
          <Input
            id="edit-constraint-name"
            aria-describedby={errors.name ? 'edit-constraint-name-error' : undefined}
            aria-invalid={!!errors.name}
            disabled={readOnly}
            {...register('name')}
          />
          {errors.name && (
            <p
              id="edit-constraint-name-error"
              role="alert"
              className="text-destructive text-xs"
            >
              {t(errors.name.message ?? 'features.planningObjects.validation.nameRequired')}
            </p>
          )}
        </div>

        {(!readOnly || constraint.description) && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-constraint-description">
              {t('features.planningObjects.common.description')}
            </Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <MarkdownEditor
                  value={field.value ?? ''}
                  onChange={(v) => field.onChange(v || null)}
                  ariaLabel={t('features.planningObjects.common.description')}
                  disabled={readOnly}
                />
              )}
            />
          </div>
        )}

        {(!readOnly || timeConstrained) && (
          <div className="flex items-center gap-2">
            <Controller
              name="timeConstrained"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="edit-constraint-time-constrained"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  disabled={readOnly}
                />
              )}
            />
            <Label
              htmlFor="edit-constraint-time-constrained"
              className={readOnly ? undefined : 'cursor-pointer'}
            >
              {t('features.planningObjects.constraints.timeBound')}
            </Label>
          </div>
        )}

        {timeConstrained && (!readOnly || constraint.dueDate) && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-constraint-due-date">
              {t('features.planningObjects.constraints.deadline')}
            </Label>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="edit-constraint-due-date"
                  value={field.value ? parseLocalDate(field.value) : null}
                  onChange={(d) => field.onChange(d ? toLocalISODate(d) : null)}
                  disabled={readOnly}
                />
              )}
            />
          </div>
        )}

        {(!readOnly || constraint.otherInformation) && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-constraint-other-info">
              {t('features.planningObjects.common.otherInfo')}
            </Label>
            <Controller
              name="otherInformation"
              control={control}
              render={({ field }) => (
                <MarkdownEditor
                  value={field.value ?? ''}
                  onChange={(v) => field.onChange(v || null)}
                  ariaLabel={t('features.planningObjects.common.otherInfo')}
                  disabled={readOnly}
                />
              )}
            />
          </div>
        )}

        {constraint.owner && (
          <div className="flex flex-col gap-1.5">
            <p className="text-sm leading-none font-medium">
              {t('features.planningObjects.constraints.owner')}
            </p>
            <p className="text-muted-foreground text-sm">
              {/* eslint-disable-next-line react/jsx-no-literals -- full-name formatting is locale-agnostic concatenation */}
              {`${constraint.owner.firstName} ${constraint.owner.lastName}`}
            </p>
          </div>
        )}
      </form>

      {(!readOnly || !!constraint.projectCharter) && (
        <div className="border-border bg-muted/30 mt-4 rounded-md border">
          <Collapsible
            open={linksOpen}
            onOpenChange={setLinksOpen}
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                aria-expanded={linksOpen}
                aria-controls="edit-constraint-links-content"
                className="text-foreground hover:text-foreground/80 flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <Link2
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                  {t('features.planningObjects.constraints.linksSection')}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    linksOpen && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div
                id="edit-constraint-links-content"
                className="border-border border-t px-4 pt-3 pb-4"
              >
                <ConstraintLinksSection
                  ref={linksRef}
                  constraint={constraint}
                  scopeId={scopeId}
                  readOnly={readOnly}
                  onDirtyChange={readOnly ? undefined : setLinksDirty}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </>
  )
}
