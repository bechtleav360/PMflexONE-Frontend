import type { ProjectSizeClassification } from './project.types'

/**
 * Form field values shared by the create-project and edit-project forms.
 *
 * Both forms collect the same fields; the only difference at the API boundary
 * is the serialisation (dates → ISO strings) and, for updates, the optimistic-
 * locking `version` field — those concerns live in the feature-level API types.
 *
 * @property name - Project name. Required; must be non-empty after trim.
 * @property sizeClassification - Project size classification. Required.
 * @property startDate - Project start date. Required.
 * @property endDate - Project end date. Required; must be on or after startDate.
 * @property description - Optional project description.
 */
export interface ProjectFormValues {
  name: string
  sizeClassification: ProjectSizeClassification
  startDate: Date
  endDate: Date
  description?: string
}
