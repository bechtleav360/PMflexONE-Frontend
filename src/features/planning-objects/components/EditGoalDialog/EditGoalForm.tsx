/* eslint-disable max-lines -- form component; line count scales with number of domain fields */
import { useEffect, useRef, useState } from 'react'

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
} from '@/shared/components'
import { cn } from '@/shared/lib/utils'

import type { GoalDetail } from '../../types/goal.types'
import type { PlanningObjectScopeType } from '../../types/shared.types'
import { formatDateTime, parseLocalDate, toLocalISODate } from '../../utils'
import type { GoalFormValues } from '../../utils/goalSchema'
import { goalFormSchema } from '../../utils/goalSchema'
import type { GoalLinksSectionHandle } from '../GoalLinksSection'
import { GoalLinksSection } from '../GoalLinksSection'

/** Props for {@link EditGoalForm}. */
interface EditGoalFormProps {
  /** The full goal detail used to pre-populate the form. */
  goalDetail: GoalDetail
  /** Called with validated form values when the user submits. */
  onSubmit: (values: GoalFormValues) => void | Promise<{ version: number } | void>
  /** Called after the full save sequence (core update + version-based links) succeeds. */
  onSuccess?: () => void
  /** When true all inputs are disabled and the save button is hidden. */
  readOnly?: boolean
  /** Scope context for link mutations. */
  scopeType: PlanningObjectScopeType
  /** ID of the scoped entity for link mutations. */
  scopeId: string
  /** ID of the parent program for the "Applies to" combobox. Pass `null` when there is none. */
  programId?: string | null
  /** ID of the parent portfolio for the "Applies to" combobox. Pass `null` when there is none. */
  portfolioId?: string | null
  /**
   * Whether to render the "Applies to" section.
   * Typically `true` for project-scoped goals.
   */
  showAppliesTo: boolean
  /** Called whenever the form dirty state changes. */
  onDirtyChange?: (dirty: boolean) => void
}

/**
 * Form for editing an existing goal.
 *
 * Pre-populates all fields from `goalDetail`. Renders a progress slider only when
 * the goal is a leaf (has no children). Auto-sets `acceptedAt` to today when
 * `acceptedById` transitions from empty to filled.
 *
 * Renders {@link GoalLinksSection} below the form fields for managing goal links.
 *
 * @param props - Component props.
 * @param props.goalDetail - Existing goal data used as default values.
 * @param props.onSubmit - Submit handler receiving validated form values.
 * @param props.scopeType - Scope context for link mutations.
 * @param props.scopeId - ID of the scoped entity for link mutations.
 * @param props.programId - Parent program ID for the "Applies to" combobox.
 * @param props.portfolioId - Parent portfolio ID for the "Applies to" combobox.
 * @param props.showAppliesTo - Whether to render the "Applies to" section.
 * @returns The rendered edit form.
 */
// eslint-disable-next-line max-lines-per-function, complexity -- form component; line count scales with number of domain fields, not logic complexity
export function EditGoalForm({
  goalDetail,
  onSubmit,
  onSuccess,
  readOnly = false,
  scopeType,
  scopeId,
  programId,
  portfolioId,
  showAppliesTo,
  onDirtyChange,
}: EditGoalFormProps) {
  const { t, i18n } = useTranslation()
  const { data: personOptions = [], isLoading: personsLoading } = usePersons()
  const isLeaf = goalDetail.children.length === 0
  const linksRef = useRef<GoalLinksSectionHandle>(null)
  const [linksOpen, setLinksOpen] = useState(true)
  const [linksDirty, setLinksDirty] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: goalDetail.name,
      description: goalDetail.description ?? null,
      progress: goalDetail.progress,
      dueDate: goalDetail.dueDate ?? null,
      keyResults: goalDetail.keyResults ?? null,
      impact: goalDetail.impact ?? null,
      outcome: goalDetail.outcome ?? null,
      otherInformation: goalDetail.otherInformation ?? null,
      acceptedById: goalDetail.acceptedBy?.id ?? null,
      acceptedAt: goalDetail.acceptedAt
        ? toLocalISODate(parseLocalDate(goalDetail.acceptedAt))
        : null,
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form watch() is subscription-based; memoization would break reactivity
  const acceptedById = watch('acceptedById')
  const acceptedAt = watch('acceptedAt')
  const progressValue = watch('progress') ?? goalDetail.progress

  useEffect(() => {
    if (acceptedById) {
      if (!acceptedAt) {
        setValue('acceptedAt', toLocalISODate(new Date()))
      }
    } else if (acceptedAt) {
      setValue('acceptedAt', null)
    }
  }, [acceptedById, acceptedAt, setValue])

  useEffect(() => {
    onDirtyChange?.(isDirty || linksDirty)
  }, [isDirty, linksDirty, onDirtyChange])

  async function handleFormSubmit(values: GoalFormValues) {
    await linksRef.current?.flushPendingRequirementLink()
    const result = await onSubmit(isLeaf ? values : { ...values, progress: undefined })
    const newVersion =
      result && typeof result === 'object' && 'version' in result
        ? (result as { version: number }).version
        : undefined
    if (newVersion !== undefined) {
      await linksRef.current?.flushVersionBased(newVersion)
      onSuccess?.()
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        noValidate
        className="flex flex-col gap-4"
        id="edit-goal-form"
      >
        <div className="flex flex-col gap-1.5">
          <p className="text-sm leading-none font-medium">
            {t('features.planningObjects.common.createdAt')}
          </p>
          <p className="text-muted-foreground text-sm">
            {formatDateTime(goalDetail.createdAt, i18n.language)}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-goal-name">
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
            id="edit-goal-name"
            aria-describedby={errors.name ? 'edit-goal-name-error' : undefined}
            aria-invalid={!!errors.name}
            disabled={readOnly}
            {...register('name')}
          />
          {errors.name && (
            <p
              id="edit-goal-name-error"
              role="alert"
              className="text-destructive text-xs"
            >
              {t(errors.name.message ?? 'features.planningObjects.validation.nameRequired')}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-goal-progress">
            {t('features.planningObjects.goals.progress')}
            {/* eslint-disable-next-line react/jsx-no-literals -- unit/separator character is layout punctuation, not translatable content */}
            {': '}
            <span className="font-semibold tabular-nums">{progressValue}</span>
            {/* eslint-disable-next-line react/jsx-no-literals -- unit/separator character is layout punctuation, not translatable content */}
            {'%'}
          </Label>
          <Controller
            name="progress"
            control={control}
            render={({ field }) => (
              <input
                id="edit-goal-progress"
                type="range"
                min={0}
                max={100}
                step={1}
                value={field.value ?? 0}
                onChange={(e) => field.onChange(Number(e.target.value))}
                disabled={readOnly || !isLeaf}
                className="accent-primary w-full disabled:opacity-50"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={field.value ?? 0}
              />
            )}
          />
        </div>

        {(!readOnly || goalDetail.description) && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-goal-description">
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

        {(!readOnly || goalDetail.dueDate) && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-goal-due-date">
              {t('features.planningObjects.common.dueDate')}
            </Label>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="edit-goal-due-date"
                  value={field.value ? parseLocalDate(field.value) : null}
                  onChange={(d) => field.onChange(d ? toLocalISODate(d) : null)}
                  disabled={readOnly}
                />
              )}
            />
          </div>
        )}

        {(!readOnly || goalDetail.keyResults) && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-goal-key-results">
              {t('features.planningObjects.goals.keyResults')}
            </Label>
            <Controller
              name="keyResults"
              control={control}
              render={({ field }) => (
                <MarkdownEditor
                  value={field.value ?? ''}
                  onChange={(v) => field.onChange(v || null)}
                  ariaLabel={t('features.planningObjects.goals.keyResults')}
                  disabled={readOnly}
                />
              )}
            />
          </div>
        )}

        {(!readOnly || goalDetail.impact) && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-goal-impact">{t('features.planningObjects.goals.impact')}</Label>
            <Controller
              name="impact"
              control={control}
              render={({ field }) => (
                <MarkdownEditor
                  value={field.value ?? ''}
                  onChange={(v) => field.onChange(v || null)}
                  ariaLabel={t('features.planningObjects.goals.impact')}
                  disabled={readOnly}
                />
              )}
            />
          </div>
        )}

        {(!readOnly || goalDetail.outcome) && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-goal-outcome">{t('features.planningObjects.goals.outcome')}</Label>
            <Controller
              name="outcome"
              control={control}
              render={({ field }) => (
                <MarkdownEditor
                  value={field.value ?? ''}
                  onChange={(v) => field.onChange(v || null)}
                  ariaLabel={t('features.planningObjects.goals.outcome')}
                  disabled={readOnly}
                />
              )}
            />
          </div>
        )}

        {(!readOnly || goalDetail.otherInformation) && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-goal-other-info">
              {t('features.planningObjects.goals.otherInformation')}
            </Label>
            <Controller
              name="otherInformation"
              control={control}
              render={({ field }) => (
                <MarkdownEditor
                  value={field.value ?? ''}
                  onChange={(v) => field.onChange(v || null)}
                  ariaLabel={t('features.planningObjects.goals.otherInformation')}
                  disabled={readOnly}
                />
              )}
            />
          </div>
        )}

        {(!readOnly || goalDetail.acceptedBy) && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-goal-accepted-by">
              {t('features.planningObjects.goals.acceptedBy')}
            </Label>
            <Controller
              name="acceptedById"
              control={control}
              render={({ field }) => (
                <Combobox
                  id="edit-goal-accepted-by"
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

        {((!readOnly && !!acceptedById) || (readOnly && !!goalDetail.acceptedAt)) && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-goal-accepted-at">
              {t('features.planningObjects.goals.acceptedAt')}
            </Label>
            <Controller
              name="acceptedAt"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="edit-goal-accepted-at"
                  value={field.value ? parseLocalDate(field.value) : null}
                  onChange={(d) => field.onChange(d ? toLocalISODate(d) : null)}
                  disabled={readOnly}
                />
              )}
            />
          </div>
        )}
      </form>

      {(!readOnly ||
        !!(
          goalDetail.projectCharter ||
          goalDetail.businessCase ||
          goalDetail.initiationRequests.length > 0 ||
          goalDetail.linkedRequirements.length > 0 ||
          goalDetail.relatedGoals.length > 0 ||
          goalDetail.parentLevelGoal
        )) && (
        <div className="border-border bg-muted/30 mt-4 rounded-md border">
          <Collapsible
            open={linksOpen}
            onOpenChange={setLinksOpen}
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                aria-expanded={linksOpen}
                aria-controls="edit-goal-links-content"
                className="text-foreground hover:text-foreground/80 flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <Link2
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                  {t('features.planningObjects.goals.linksSection')}
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
                id="edit-goal-links-content"
                className="border-border border-t px-4 pt-3 pb-4"
              >
                <GoalLinksSection
                  ref={linksRef}
                  goalId={goalDetail.id}
                  goalVersion={goalDetail.version}
                  goalDetail={goalDetail}
                  scopeType={scopeType}
                  scopeId={scopeId}
                  programId={programId}
                  portfolioId={portfolioId}
                  showAppliesTo={showAppliesTo}
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
