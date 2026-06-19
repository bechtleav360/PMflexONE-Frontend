import type { StakeholderEntry } from '@/entities/stakeholder'
import type { ScopeType } from '@/shared/types/scopeType'

import type { StakeholderFormValues } from './stakeholderSchema'

/**
 * Coerces an optional/nullable string to `null` when absent.
 *
 * @param v - The value to normalise.
 * @returns The original string, or `null` if the value is `null` or `undefined`.
 */
function nullableString(v: string | null | undefined): string | null {
  return v ?? null
}

/**
 * Maps a {@link StakeholderEntry} to the form value shape used by the stakeholder dialog.
 *
 * @param entry - The entity to map.
 * @returns Form values pre-filled from the entry.
 */
export function entryToFormValues(entry: StakeholderEntry): StakeholderFormValues {
  return {
    name: entry.name,
    role: entry.role,
    contactGroup: entry.contactGroup,
    email: nullableString(entry.email),
    email2: nullableString(entry.email2),
    email3: nullableString(entry.email3),
    phone: nullableString(entry.phone),
    phone2: nullableString(entry.phone2),
    phone3: nullableString(entry.phone3),
    preferredCommunicationType: nullableString(entry.preferredCommunicationType),
    matrixPosition: entry.matrixPosition ?? null,
    typeOfAffectedness: entry.typeOfAffectedness ?? 'NEUTRAL',
    conflictPotential: entry.conflictPotential,
    expectations: nullableString(entry.expectations),
    responsible: entry.responsible?.id ?? null,
    inclusionMeasures: nullableString(entry.inclusionMeasures),
    memberId: entry.linkedMember?.id ?? null,
    logs: entry.logs.map((log) => ({
      id: log.id,
      version: log.version,
      date: log.date,
      content: log.content,
    })),
  }
}

/** Input shape for the `CreateStakeholderEntry` GraphQL mutation. */
export interface CreateStakeholderInput {
  scopeType: ScopeType
  scopeId: string
  name: string
  role: string
  contactGroup: StakeholderFormValues['contactGroup']
  email?: string | null
  email2?: string | null
  email3?: string | null
  phone?: string | null
  phone2?: string | null
  phone3?: string | null
  preferredCommunicationType?: string | null
  matrixPosition?: StakeholderFormValues['matrixPosition']
  typeOfAffectedness?: StakeholderFormValues['typeOfAffectedness']
  conflictPotential?: StakeholderFormValues['conflictPotential']
  expectations?: string | null
  responsibleId?: string | null
  inclusionMeasures?: string | null
  memberId?: string | null
}

/** Input shape for the `UpdateStakeholderEntry` GraphQL mutation. */
export interface UpdateStakeholderInput {
  name?: string
  role?: string
  contactGroup?: StakeholderFormValues['contactGroup']
  email?: string | null
  email2?: string | null
  email3?: string | null
  phone?: string | null
  phone2?: string | null
  phone3?: string | null
  preferredCommunicationType?: string | null
  matrixPosition?: StakeholderFormValues['matrixPosition']
  typeOfAffectedness?: StakeholderFormValues['typeOfAffectedness']
  conflictPotential?: StakeholderFormValues['conflictPotential']
  expectations?: string | null
  responsibleId?: string | null
  inclusionMeasures?: string | null
  memberId?: string | null
}

/**
 * Maps stakeholder form values to a create mutation input.
 *
 * @param values - The form values submitted by the user.
 * @param scopeType - The type of scope the stakeholder belongs to.
 * @param scopeId - The ID of the scope the stakeholder belongs to.
 * @returns An input object suitable for the `CreateStakeholderEntry` mutation.
 */
export function formValuesToCreateInput(
  values: StakeholderFormValues,
  scopeType: ScopeType,
  scopeId: string,
): CreateStakeholderInput {
  return {
    scopeType,
    scopeId,
    name: values.name,
    role: values.role,
    contactGroup: values.contactGroup,
    email: nullableString(values.email),
    email2: nullableString(values.email2),
    email3: nullableString(values.email3),
    phone: nullableString(values.phone),
    phone2: nullableString(values.phone2),
    phone3: nullableString(values.phone3),
    preferredCommunicationType: nullableString(values.preferredCommunicationType),
    matrixPosition: values.matrixPosition ?? null,
    typeOfAffectedness: values.typeOfAffectedness ?? null,
    conflictPotential: values.conflictPotential ?? null,
    expectations: nullableString(values.expectations),
    responsibleId: nullableString(values.responsible),
    inclusionMeasures: nullableString(values.inclusionMeasures),
    memberId: nullableString(values.memberId),
  }
}

/**
 * Maps stakeholder form values to an update mutation input.
 *
 * @param values - The form values submitted by the user.
 * @returns An input object suitable for the `UpdateStakeholderEntry` mutation.
 */
export function formValuesToUpdateInput(values: StakeholderFormValues): UpdateStakeholderInput {
  return {
    name: values.name,
    role: values.role,
    contactGroup: values.contactGroup,
    email: nullableString(values.email),
    email2: nullableString(values.email2),
    email3: nullableString(values.email3),
    phone: nullableString(values.phone),
    phone2: nullableString(values.phone2),
    phone3: nullableString(values.phone3),
    preferredCommunicationType: nullableString(values.preferredCommunicationType),
    matrixPosition: values.matrixPosition ?? null,
    typeOfAffectedness: values.typeOfAffectedness ?? null,
    conflictPotential: values.conflictPotential ?? null,
    expectations: nullableString(values.expectations),
    responsibleId: nullableString(values.responsible),
    inclusionMeasures: nullableString(values.inclusionMeasures),
    memberId: nullableString(values.memberId),
  }
}
