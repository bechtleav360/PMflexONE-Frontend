import { useTranslation } from 'react-i18next'

import { useListProjects, type Project } from '@/entities/project'
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

interface ProjectSelectorFieldProps {
  /** The currently selected project ID, or empty string if none selected. */
  value: string
  /** Called with the new project ID when the user makes a selection. */
  onChange: (id: string) => void
  /** When true, the selector is rendered as read-only. */
  disabled?: boolean
  /** HTML id for the trigger element — used to associate the Label. */
  id?: string
  /** Error message to display below the selector. */
  errorMessage?: string
  /** When true, required-field asterisk is hidden (view mode). */
  isView?: boolean
}

/**
 * A project selector field backed by the existing `useListProjects` query.
 * Uses the shared Select component for accessible keyboard navigation and selection.
 * The displayed option list is the full tenant project list; Radix Select provides
 * native keyboard typeahead filtering.
 *
 * @param props - Component props.
 * @param props.value - Currently selected project ID.
 * @param props.onChange - Callback invoked with the selected project ID.
 * @param props.disabled - When true, the selector is non-interactive.
 * @param props.id - HTML id for the trigger element.
 * @param props.errorMessage - Validation error message to display.
 * @param props.isView - When true, the required-field asterisk is hidden.
 * @returns The project selector field group with label and optional inline error.
 */
export function ProjectSelectorField({
  value,
  onChange,
  disabled = false,
  id = 'project-selector',
  errorMessage,
  isView = false,
}: ProjectSelectorFieldProps) {
  const { t } = useTranslation()
  const { data: projects = [], isPending } = useListProjects()
  const errorId = errorMessage !== undefined ? `${id}-error` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {t('pages.initiationRequests.form.requestingProjectLabel')}
        {!isView && (
          <span
            className="text-destructive ml-0.5"
            aria-hidden="true"
          >
            {REQUIRED_MARKER}
          </span>
        )}
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled || isPending}
      >
        <SelectTrigger
          id={id}
          aria-invalid={errorMessage !== undefined}
          aria-describedby={errorId}
          aria-required={isView ? undefined : 'true'}
        >
          <SelectValue
            placeholder={t('pages.initiationRequests.form.requestingProjectPlaceholder')}
          />
        </SelectTrigger>
        <SelectContent>
          {renderProjectOptions(
            projects,
            t('pages.initiationRequests.form.requestingProjectEmpty'),
          )}
        </SelectContent>
      </Select>
      {errorMessage && (
        <p
          id={errorId}
          role="alert"
          className="text-destructive text-sm"
        >
          {errorMessage}
        </p>
      )}
    </div>
  )
}

function renderProjectOptions(projects: Project[], emptyMessage: string) {
  if (projects.length === 0) {
    return <div className="text-muted-foreground px-2 py-1.5 text-sm">{emptyMessage}</div>
  }
  return projects.map((project) => (
    <SelectItem
      key={project.id}
      value={project.id}
    >
      {project.name}
    </SelectItem>
  ))
}
