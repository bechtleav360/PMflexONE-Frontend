import type { ScopeType } from '@/shared/types/scopeType'

/** Union of valid stakeholder contact group values. */
export type ContactGroup = 'INTERNAL' | 'CUSTOMER' | 'SUPPLIER' | 'PARTNER'

/** Union of valid stakeholder type-of-affectedness values. */
export type TypeOfAffectedness = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'

/** Union of valid stakeholder conflict potential values. */
export type ConflictPotential = 'LOW' | 'MEDIUM' | 'HIGH'

/** Union of valid behavioural strategy quadrant values derived from the influence-attitude matrix. */
export type BehaviouralStrategy = 'MONITOR' | 'KEEP_INFORMED' | 'KEEP_SATISFIED' | 'MANAGE_CLOSELY'

/** Normalised [0, 1] coordinates. x = degree of affectedness, y = degree of influence. */
export interface MatrixPosition {
  x: number
  y: number
}

/** A person resolved from the profile module (responsible / linked member). */
export interface Person {
  id: string
  firstName: string
  lastName: string
  mail: string | null
}

/**
 * A project/programme/portfolio member option for the link pickers.
 * Extends {@link Person} with the RASCI role name(s) the person holds on the
 * object, so selecting a member can prefill the stakeholder role field.
 */
export interface ProjectMember extends Person {
  /** Display names of all RASCI roles this person holds on the object (deduped). */
  roleNames: string[]
}

/** The scope (Project / Program / Portfolio) that owns a stakeholder resource. */
export interface Scope {
  id: string
  name: string
  scopeType: ScopeType
}

/** Strategy description text per influence-attitude quadrant for a given scope. */
export interface StrategyDescription {
  id: string
  version: number
  monitor: string | null
  keepInformed: string | null
  keepSatisfied: string | null
  manageClosely: string | null
  scope: Scope
  createdAt: string
  updatedAt: string
}

/** An activity log entry attached to a stakeholder. */
export interface StakeholderLog {
  id: string
  version: number
  /** ISO 8601 date string (YYYY-MM-DD). */
  date: string
  content: string
  createdAt: string
  updatedAt: string
}

/** Full stakeholder entry including matrix position, RASCI data, and activity logs. */
export interface StakeholderEntry {
  id: string
  version: number
  name: string
  role: string
  contactGroup: ContactGroup
  email: string | null
  email2: string | null
  email3: string | null
  phone: string | null
  phone2: string | null
  phone3: string | null
  preferredCommunicationType: string | null
  matrixPosition: MatrixPosition | null
  typeOfAffectedness: TypeOfAffectedness | null
  conflictPotential: ConflictPotential | null
  expectations: string | null
  responsible: Person | null
  inclusionMeasures: string | null
  linkedMember: Person | null
  behaviouralStrategy: BehaviouralStrategy | null
  scope: Scope
  logs: StakeholderLog[]
  createdAt: string
  updatedAt: string
}
