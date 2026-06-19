/** Maps RequirementScope enum values to i18n keys. */
export const REQUIREMENT_SCOPE_LABELS: Record<string, string> = {
  IN_SCOPE: 'features.planningObjects.requirements.scope.inScope',
  OUT_OF_SCOPE: 'features.planningObjects.requirements.scope.outOfScope',
}

/** Maps RequirementType enum values to i18n keys. */
export const REQUIREMENT_TYPE_LABELS: Record<string, string> = {
  FUNCTIONAL: 'features.planningObjects.requirements.type.functional',
  NON_FUNCTIONAL: 'features.planningObjects.requirements.type.nonFunctional',
  CONSTRAINT: 'features.planningObjects.requirements.type.constraint',
}

/** Maps RequirementPriority enum values to i18n keys. */
export const REQUIREMENT_PRIORITY_LABELS: Record<string, string> = {
  MUST_HAVE: 'features.planningObjects.requirements.priority.mustHave',
  SHOULD_HAVE: 'features.planningObjects.requirements.priority.shouldHave',
  COULD_HAVE: 'features.planningObjects.requirements.priority.couldHave',
  WONT_HAVE: 'features.planningObjects.requirements.priority.wontHave',
}

/** Maps RequirementStatus enum values to i18n keys. */
export const REQUIREMENT_STATUS_LABELS: Record<string, string> = {
  NEW: 'features.planningObjects.requirements.status.new',
  ANALYSED: 'features.planningObjects.requirements.status.analysed',
  SPECIFIED: 'features.planningObjects.requirements.status.specified',
  IMPLEMENTED: 'features.planningObjects.requirements.status.implemented',
  TESTED: 'features.planningObjects.requirements.status.tested',
  ACCEPTED: 'features.planningObjects.requirements.status.accepted',
}

/**
 * Maps RequirementDependencyEdgeType values to i18n keys.
 * Both canonical (BLOCKS) and inverse (IS_BLOCKED_BY) edge types are included.
 */
export const DEPENDENCY_TYPE_LABELS: Record<string, string> = {
  blocks: 'features.planningObjects.requirements.dep.blocks',
  blocked_by: 'features.planningObjects.requirements.dep.isBlockedBy',
  duplicates: 'features.planningObjects.requirements.dep.duplicates',
  duplicated_by: 'features.planningObjects.requirements.dep.isDuplicatedBy',
  relates_to: 'features.planningObjects.requirements.dep.relatesTo',
}
