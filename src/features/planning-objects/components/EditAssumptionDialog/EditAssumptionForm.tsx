/* eslint-disable max-lines -- form component; line count scales with number of domain fields */
import { useCallback, useEffect, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, Link2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { usePersons } from '@/entities/person'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Combobox,
  DatePicker,
  Input,
  Label,
  MarkdownEditor,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components'
import { cn } from '@/shared/lib/utils'

import type { AssumptionListItem } from '../../types/assumption.types'
import { formatDateTime, parseLocalDate, toLocalISODate } from '../../utils'
import type { AssumptionFormValues } from '../../utils/assumptionSchema'
import { assumptionFormSchema } from '../../utils/assumptionSchema'
import type { AssumptionLinksSectionHandle } from '../AssumptionLinksSection'
import { AssumptionLinksSection } from '../AssumptionLinksSection'
import { AssumptionRiskSection } from '../AssumptionRiskSection'

/** Props for {@link EditAssumptionForm}. */
interface EditAssumptionFormProps {
  /** The assumption being edited. */
  assumption: AssumptionListItem
  /** The project scope ID used for risk navigation. */
  scopeId: string
  /** Called with validated form values when the user submits. */
  onSubmit: (values: AssumptionFormValues) => void
  /** When provided, passed through to AssumptionLinksSection to enable clicking the linked risk badge. */
  onNavigateToRisk?: (riskId: string) => void
  /** When true all inputs are disabled and the save button is hidden. */
  readOnly?: boolean
  /** Called whenever the form dirty state changes. */
  onDirtyChange?: (dirty: boolean) => void
}

/**
 * Form for editing an existing assumption.
 *
 * Pre-populates all fields from the provided assumption data.
 * `hasRiskWriteAccess` is always `true` per spec (RBAC is out of scope for this feature).
 *
 * @param props - Component props.
 * @param props.assumption - The assumption to edit.
 * @param props.scopeId - Project scope ID for risk navigation.
 * @param props.onSubmit - Submit handler receiving validated form values.
 * @returns The rendered edit form.
 */
// eslint-disable-next-line max-lines-per-function, complexity -- form component; line count scales with number of domain fields, not logic complexity
export function EditAssumptionForm({
  assumption,
  scopeId,
  onSubmit,
  onNavigateToRisk: _onNavigateToRisk,
  readOnly = false,
  onDirtyChange,
}: EditAssumptionFormProps) {
  const { t, i18n } = useTranslation()
  const linksRef = useRef<AssumptionLinksSectionHandle>(null)
  const [linksOpen, setLinksOpen] = useState(true)
  const [linksDirty, setLinksDirty] = useState(false)
  const { data: personOptions = [], isLoading: personsLoading } = usePersons()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<AssumptionFormValues>({
    resolver: zodResolver(assumptionFormSchema),
    defaultValues: {
      name: assumption.name,
      description: assumption.description ?? null,
      dueDate: assumption.dueDate ?? null,
      validationStatus: assumption.validationStatus,
      isRisk: assumption.isRisk,
      otherInformation: assumption.otherInformation ?? null,
      validatedById: assumption.validatedBy?.id ?? null,
    },
  })

  useEffect(() => {
    onDirtyChange?.(isDirty || linksDirty)
  }, [isDirty, linksDirty, onDirtyChange])

  const flushAndSubmit = useCallback(
    async (values: AssumptionFormValues) => {
      await linksRef.current?.flush()
      onSubmit(values)
    },
    [onSubmit],
  )

  // eslint-disable-next-line react-hooks/refs -- flushAndSubmit reads linksRef.current inside a callback, not during render; the ref is accessed only when the form submits
  const handleFormSubmit = handleSubmit(flushAndSubmit)

  return (
    <>
      <form
        onSubmit={handleFormSubmit}
        noValidate
        className="flex flex-col gap-4"
        id="edit-assumption-form"
      >
        <div className="flex flex-col gap-1.5">
          <p className="text-sm leading-none font-medium">
            {t('features.planningObjects.common.createdAt')}
          </p>
          <p className="text-muted-foreground text-sm">
            {formatDateTime(assumption.createdAt, i18n.language)}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-assumption-name">
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
            id="edit-assumption-name"
            aria-describedby={errors.name ? 'edit-assumption-name-error' : undefined}
            aria-invalid={!!errors.name}
            disabled={readOnly}
            {...register('name')}
          />
          {errors.name && (
            <p
              id="edit-assumption-name-error"
              role="alert"
              className="text-destructive text-xs"
            >
              {t(errors.name.message ?? 'features.planningObjects.validation.nameRequired')}
            </p>
          )}
        </div>

        {(!readOnly || assumption.description) && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-assumption-description">
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

        {(!readOnly || assumption.dueDate) && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-assumption-due-date">
              {t('features.planningObjects.assumptions.dueDate')}
            </Label>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="edit-assumption-due-date"
                  value={field.value ? parseLocalDate(field.value) : null}
                  onChange={(d) => field.onChange(d ? toLocalISODate(d) : null)}
                  disabled={readOnly}
                />
              )}
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-assumption-validation-status">
            {t('features.planningObjects.assumptions.validationStatusLabel')}
            {!readOnly && (
              <span
                aria-hidden="true"
                className="text-destructive ml-0.5"
              >
                {/* eslint-disable-next-line react/jsx-no-literals -- required-field asterisk is a UI convention, not translatable content */}
                {'*'}
              </span>
            )}
          </Label>
          <Controller
            name="validationStatus"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={readOnly}
              >
                <SelectTrigger id="edit-assumption-validation-status">
                  <SelectValue placeholder={t('shared.combobox.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {(['OPEN', 'IN_REVIEW', 'VALIDATED', 'REFUTED'] as const).map((v) => (
                    <SelectItem
                      key={v}
                      value={v}
                    >
                      {t(`features.planningObjects.assumptions.validationStatusValues.${v}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {(!readOnly || assumption.isRisk || assumption.linkedRisk) && (
          <Controller
            name="isRisk"
            control={control}
            render={({ field }) => (
              <AssumptionRiskSection
                isRisk={field.value}
                linkedRisk={assumption.linkedRisk}
                hasRiskWriteAccess={!readOnly}
                onIsRiskChange={(v) => field.onChange(v)}
                scopeId={scopeId}
              />
            )}
          />
        )}

        {(!readOnly || assumption.otherInformation) && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-assumption-other-info">
              {t('features.planningObjects.assumptions.otherInformation')}
            </Label>
            <Controller
              name="otherInformation"
              control={control}
              render={({ field }) => (
                <MarkdownEditor
                  value={field.value ?? ''}
                  onChange={(v) => field.onChange(v || null)}
                  ariaLabel={t('features.planningObjects.assumptions.otherInformation')}
                  disabled={readOnly}
                />
              )}
            />
          </div>
        )}

        {(!readOnly || assumption.validatedBy) && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-assumption-validated-by">
              {t('features.planningObjects.assumptions.validatedBy')}
            </Label>
            <Controller
              name="validatedById"
              control={control}
              render={({ field }) => (
                <Combobox
                  id="edit-assumption-validated-by"
                  value={field.value ?? null}
                  onChange={(v) => field.onChange(v)}
                  options={personOptions}
                  loading={personsLoading}
                  disabled={readOnly}
                />
              )}
            />
          </div>
        )}
      </form>

      {(!readOnly || !!(assumption.projectCharter || assumption.relatedRisks.length > 0)) && (
        <div className="border-border bg-muted/30 mt-4 rounded-md border">
          <Collapsible
            open={linksOpen}
            onOpenChange={setLinksOpen}
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                aria-expanded={linksOpen}
                aria-controls="edit-assumption-links-content"
                className="text-foreground hover:text-foreground/80 flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <Link2
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                  {t('features.planningObjects.assumptions.linksSection')}
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
            <CollapsibleContent forceMount>
              <div
                id="edit-assumption-links-content"
                className="border-border border-t px-4 pt-3 pb-4"
              >
                <AssumptionLinksSection
                  ref={linksRef}
                  assumption={assumption}
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
