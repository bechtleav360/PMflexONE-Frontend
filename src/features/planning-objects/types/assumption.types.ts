import type { EntityRefWithStatus, Person } from './shared.types'

/** Assumption validation status lookup entry. */
export interface AssumptionValidationStatus {
  status: string
  description: string
  displayOrder: number
}

/** Minimal risk reference linked to an assumption. */
export interface LinkedRisk {
  id: string
  name: string
  status: string
}

/** Assumption item as returned by the list and detail queries. */
export interface AssumptionListItem {
  id: string
  version: number
  name: string
  description: string | null
  dueDate: string | null
  validationStatus: string
  isRisk: boolean
  otherInformation: string | null
  createdAt: string
  updatedAt: string
  creator: Person | null
  updater: Person | null
  validatedBy: Person | null
  linkedRisk: LinkedRisk | null
  relatedRisks: Array<{ id: string; name: string }>
  projectCharter: EntityRefWithStatus | null
  scope?: { id: string; scopeType: 'Project' }
}

/** Input shape for creating a new assumption. */
export interface CreateAssumptionInput {
  name: string
  scopeType: 'Project'
  scopeId: string
  description?: string | null
  dueDate?: string | null
  validationStatus?: string
  isRisk?: boolean
  otherInformation?: string | null
  validatedById?: string | null
}

/** Input shape for updating an existing assumption. */
export interface UpdateAssumptionInput {
  version: number
  name?: string
  description?: string | null
  dueDate?: string | null
  validationStatus?: string
  isRisk?: boolean
  otherInformation?: string | null
  validatedById?: string | null
}
