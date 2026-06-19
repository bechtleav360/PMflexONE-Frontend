/* eslint-disable max-lines -- MSW handler module groups all planning-objects mock routes; line count scales with number of domain operations */
import { graphql, HttpResponse } from 'msw'

type Person = { id: string; firstName: string; lastName: string; mail: string }
type ScopeRef = { id: string; type: 'Project' | 'Program' | 'Portfolio' }
type EntityRef = { id: string; name: string }

// ---------------------------------------------------------------------------
// Goal types & seed data
// ---------------------------------------------------------------------------

type Goal = {
  id: string
  version: number
  name: string
  description: string | null
  progress: number
  dueDate: string | null
  keyResults: string | null
  otherInformation: string | null
  acceptedAt: string | null
  createdAt: string
  updatedAt: string
  creator: Person | null
  updater: Person | null
  acceptedBy: Person | null
  parent: { id: string } | null
  scope: ScopeRef
  parentLevelGoalName: string | null
  parentLevelGoal: EntityRef | null
  relatedGoals: EntityRef[]
  linkedRequirements: Array<{ id: string; name: string; status: string }>
  businessCase: EntityRef | null
  projectCharter: EntityRef | null
  initiationRequests: EntityRef[]
}

const devGoals: Goal[] = [
  {
    id: 'goal-seed-1',
    version: 1,
    name: 'Reduce project delivery time by 20%',
    description: 'Streamline processes to cut delivery time in Q4.',
    progress: 55,
    dueDate: '2026-12-31',
    keyResults: '- Milestone A delivered on time\n- Milestone B delivered on time',
    otherInformation: null,
    acceptedAt: '2026-01-15T10:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
    creator: null,
    updater: null,
    acceptedBy: null,
    parent: null,
    scope: { id: 'test-project-1', type: 'Project' },
    parentLevelGoalName: null,
    parentLevelGoal: null,
    relatedGoals: [],
    linkedRequirements: [],
    businessCase: null,
    projectCharter: null,
    initiationRequests: [],
  },
  {
    id: 'goal-seed-2',
    version: 1,
    name: 'Automate CI/CD pipeline',
    description: 'Set up automated testing and deployment.',
    progress: 30,
    dueDate: '2026-09-30',
    keyResults: null,
    otherInformation: null,
    acceptedAt: null,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z',
    creator: null,
    updater: null,
    acceptedBy: null,
    parent: { id: 'goal-seed-1' },
    scope: { id: 'test-project-1', type: 'Project' },
    parentLevelGoalName: null,
    parentLevelGoal: null,
    relatedGoals: [],
    linkedRequirements: [],
    businessCase: null,
    projectCharter: null,
    initiationRequests: [],
  },
  {
    id: 'goal-seed-3',
    version: 1,
    name: 'Refactor legacy modules',
    description: 'Rewrite the three oldest modules for maintainability.',
    progress: 80,
    dueDate: '2026-06-30',
    keyResults: null,
    otherInformation: null,
    acceptedAt: null,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
    creator: null,
    updater: null,
    acceptedBy: null,
    parent: { id: 'goal-seed-1' },
    scope: { id: 'test-project-1', type: 'Project' },
    parentLevelGoalName: null,
    parentLevelGoal: null,
    relatedGoals: [],
    linkedRequirements: [],
    businessCase: null,
    projectCharter: null,
    initiationRequests: [],
  },
  {
    id: 'goal-seed-4',
    version: 1,
    name: 'Improve team onboarding',
    description: null,
    progress: 10,
    dueDate: null,
    keyResults: null,
    otherInformation: null,
    acceptedAt: null,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
    creator: null,
    updater: null,
    acceptedBy: null,
    parent: null,
    scope: { id: 'test-project-1', type: 'Project' },
    parentLevelGoalName: null,
    parentLevelGoal: null,
    relatedGoals: [],
    linkedRequirements: [],
    businessCase: null,
    projectCharter: null,
    initiationRequests: [],
  },
]
let nextGoalId = 100

// ---------------------------------------------------------------------------
// Requirement types & seed data
// ---------------------------------------------------------------------------

type Requirement = {
  id: string
  version: number
  name: string
  requirementScope: 'IN_SCOPE' | 'OUT_OF_SCOPE'
  source: 'INTERNAL' | 'EXTERNAL' | null
  estimatedEffortMin: number | null
  estimatedEffortMax: number | null
  type: 'FUNCTIONAL' | 'NON_FUNCTIONAL' | 'CONSTRAINT'
  priority: 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE' | 'WONT_HAVE'
  status: 'NEW' | 'ANALYSED' | 'SPECIFIED' | 'IMPLEMENTED' | 'TESTED' | 'ACCEPTED'
  description: string | null
  acceptanceCriteria: string | null
  createdAt: string
  updatedAt: string
  creator: Person | null
  updater: Person | null
  parent: { id: string } | null
  scope: ScopeRef
  dependencies: Array<{
    edgeTypeName: string
    requirement: { id: string; name: string; status: string }
  }>
  linkedGoals: EntityRef[]
}

const devRequirements: Requirement[] = [
  {
    id: 'req-seed-1',
    version: 1,
    name: 'User authentication via SSO',
    requirementScope: 'IN_SCOPE',
    source: 'INTERNAL',
    estimatedEffortMin: 5,
    estimatedEffortMax: 8,
    type: 'FUNCTIONAL',
    priority: 'MUST_HAVE',
    status: 'ANALYSED',
    description: 'Support SAML 2.0 SSO for corporate identity provider.',
    acceptanceCriteria: 'Users can log in without separate credentials.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
    creator: null,
    updater: null,
    parent: null,
    scope: { id: 'test-project-1', type: 'Project' },
    dependencies: [],
    linkedGoals: [],
  },
  {
    id: 'req-seed-2',
    version: 1,
    name: 'Offline mode support',
    requirementScope: 'OUT_OF_SCOPE',
    source: 'EXTERNAL',
    estimatedEffortMin: null,
    estimatedEffortMax: null,
    type: 'FUNCTIONAL',
    priority: 'COULD_HAVE',
    status: 'NEW',
    description: 'Allow the app to work without internet connection.',
    acceptanceCriteria: null,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z',
    creator: null,
    updater: null,
    parent: null,
    scope: { id: 'test-project-1', type: 'Project' },
    dependencies: [],
    linkedGoals: [],
  },
  {
    id: 'req-seed-3',
    version: 1,
    name: 'Session timeout after 30 min inactivity',
    requirementScope: 'IN_SCOPE',
    source: 'INTERNAL',
    estimatedEffortMin: 1,
    estimatedEffortMax: 2,
    type: 'NON_FUNCTIONAL',
    priority: 'MUST_HAVE',
    status: 'SPECIFIED',
    description: null,
    acceptanceCriteria: 'Session expires and user is redirected to login.',
    createdAt: '2026-01-08T00:00:00Z',
    updatedAt: '2026-01-12T00:00:00Z',
    creator: null,
    updater: null,
    parent: { id: 'req-seed-1' },
    scope: { id: 'test-project-1', type: 'Project' },
    dependencies: [
      {
        edgeTypeName: 'blocks',
        requirement: { id: 'req-seed-1', name: 'User authentication via SSO', status: 'ANALYSED' },
      },
    ],
    linkedGoals: [],
  },
  {
    id: 'req-seed-4',
    version: 1,
    name: 'Audit logging for all write operations',
    requirementScope: 'IN_SCOPE',
    source: 'INTERNAL',
    estimatedEffortMin: 3,
    estimatedEffortMax: 5,
    type: 'NON_FUNCTIONAL',
    priority: 'SHOULD_HAVE',
    status: 'NEW',
    description: 'Every create/update/delete must be logged with user and timestamp.',
    acceptanceCriteria: null,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
    creator: null,
    updater: null,
    parent: null,
    scope: { id: 'test-project-1', type: 'Project' },
    dependencies: [],
    linkedGoals: [],
  },
]
let nextRequirementId = 100

// ---------------------------------------------------------------------------
// Assumption types & seed data
// ---------------------------------------------------------------------------

type Assumption = {
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
  linkedRisk: EntityRef | null
  linkedRisks: EntityRef[]
  projectCharter: EntityRef | null
  scope: { id: string; type: 'Project' }
}

const devAssumptions: Assumption[] = [
  {
    id: 'assum-seed-1',
    version: 1,
    name: 'Backend team available from Q2',
    description: 'We assume the backend team will be fully allocated from April onwards.',
    dueDate: '2026-04-01',
    validationStatus: 'ASSUMED',
    isRisk: false,
    otherInformation: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    creator: null,
    updater: null,
    validatedBy: null,
    linkedRisk: null,
    linkedRisks: [],
    projectCharter: null,
    scope: { id: 'test-project-1', type: 'Project' },
  },
  {
    id: 'assum-seed-2',
    version: 1,
    name: 'Legacy API contracts will remain stable',
    description: 'No breaking changes expected from the legacy integration partner.',
    dueDate: null,
    validationStatus: 'VALIDATED',
    isRisk: false,
    otherInformation: 'Confirmed by integration partner in writing on 2026-01-10.',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
    creator: null,
    updater: null,
    validatedBy: null,
    linkedRisk: null,
    linkedRisks: [],
    projectCharter: null,
    scope: { id: 'test-project-1', type: 'Project' },
  },
  {
    id: 'assum-seed-3',
    version: 1,
    name: 'Cloud infrastructure cost stays within budget',
    description: 'Monthly cloud costs assumed to stay below €5,000.',
    dueDate: '2026-06-30',
    validationStatus: 'UNCERTAIN',
    isRisk: true,
    otherInformation: null,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
    creator: null,
    updater: null,
    validatedBy: null,
    linkedRisk: { id: 'risk-seed-1', name: 'Budget overrun' },
    linkedRisks: [],
    projectCharter: null,
    scope: { id: 'test-project-1', type: 'Project' },
  },
]
let nextAssumptionId = 100

// ---------------------------------------------------------------------------
// Constraint types & seed data
// ---------------------------------------------------------------------------

type ProjectConstraint = {
  id: string
  version: number
  name: string
  description: string | null
  timeConstrained: boolean
  dueDate: string | null
  otherInformation: string | null
  createdAt: string
  updatedAt: string
  creator: Person | null
  updater: Person | null
  owner: Person | null
  projectCharter: EntityRef | null
  scope: { id: string; type: 'Project' }
}

const devConstraints: ProjectConstraint[] = [
  {
    id: 'con-seed-1',
    version: 1,
    name: 'Budget cap of €150,000',
    description: 'Total project budget must not exceed €150,000.',
    timeConstrained: false,
    dueDate: null,
    otherInformation: 'Approved by finance committee.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    creator: null,
    updater: null,
    owner: null,
    projectCharter: null,
    scope: { id: 'test-project-1', type: 'Project' },
  },
  {
    id: 'con-seed-2',
    version: 1,
    name: 'Go-live deadline',
    description: 'System must be production-ready by the agreed contract date.',
    timeConstrained: true,
    dueDate: '2026-12-15',
    otherInformation: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    creator: null,
    updater: null,
    owner: null,
    projectCharter: null,
    scope: { id: 'test-project-1', type: 'Project' },
  },
  {
    id: 'con-seed-3',
    version: 1,
    name: 'Technology stack frozen after architecture review',
    description: 'No new frameworks or libraries may be introduced post architecture review.',
    timeConstrained: false,
    dueDate: null,
    otherInformation: null,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
    creator: null,
    updater: null,
    owner: null,
    projectCharter: null,
    scope: { id: 'test-project-1', type: 'Project' },
  },
]
let nextConstraintId = 100

// ---------------------------------------------------------------------------
// Goal handlers
// ---------------------------------------------------------------------------

const getGoalsHandler = graphql.query('GetGoals', ({ variables }) => {
  const filter = (variables as { filter?: { scopeType?: string; scopeId?: string } }).filter ?? {}
  const goals = devGoals.filter((g) => {
    if (filter.scopeType && g.scope.type !== filter.scopeType) return false
    if (filter.scopeId && g.scope.id !== filter.scopeId) return false
    return true
  })
  return HttpResponse.json({ data: { goals } })
})

const getGoalHandler = graphql.query('GetGoal', ({ variables }) => {
  const { id } = variables as { id: string }
  return HttpResponse.json({ data: { goal: devGoals.find((g) => g.id === id) ?? null } })
})

const createGoalHandler = graphql.mutation('CreateGoal', ({ variables }) => {
  const { input } = variables as { input: Record<string, unknown> }
  const now = new Date().toISOString()
  const goal: Goal = {
    id: `goal-${nextGoalId++}`,
    version: 1,
    name: input.name as string,
    description: (input.description as string | null) ?? null,
    progress: 0,
    dueDate: (input.dueDate as string | null) ?? null,
    keyResults: (input.keyResults as string | null) ?? null,
    otherInformation: (input.otherInformation as string | null) ?? null,
    acceptedAt: null,
    createdAt: now,
    updatedAt: now,
    creator: null,
    updater: null,
    acceptedBy: null,
    parent: null,
    scope: {
      id: input.scopeId as string,
      type: input.scopeType as 'Project' | 'Program' | 'Portfolio',
    },
    parentLevelGoalName: null,
    parentLevelGoal: null,
    relatedGoals: [],
    linkedRequirements: [],
    businessCase: null,
    projectCharter: null,
    initiationRequests: [],
  }
  devGoals.push(goal)
  return HttpResponse.json({ data: { createGoal: goal } })
})

const updateGoalHandler = graphql.mutation('UpdateGoal', ({ variables }) => {
  const { input } = variables as { input: Record<string, unknown> }
  const existing = devGoals.find((g) => g.id === (input.id as string))
  if (!existing)
    return HttpResponse.json({ errors: [{ message: 'Goal not found' }] }, { status: 200 })
  Object.assign(existing, {
    ...input,
    updatedAt: new Date().toISOString(),
    version: existing.version + 1,
  })
  return HttpResponse.json({ data: { updateGoal: existing } })
})

const deleteGoalHandler = graphql.mutation('DeleteGoal', ({ variables }) => {
  const { id, cascade } = variables as { id: string; version: number; cascade: boolean }
  const idx = devGoals.findIndex((g) => g.id === id)
  if (idx !== -1) {
    devGoals.splice(idx, 1)
    if (cascade) {
      let i = devGoals.length - 1
      while (i >= 0) {
        if (devGoals[i].parent?.id === id) devGoals.splice(i, 1)
        i--
      }
    }
  }
  return HttpResponse.json({ data: { deleteGoal: true } })
})

const setGoalParentHandler = graphql.mutation('SetGoalParent', ({ variables }) => {
  const { goalId, parentId, version } = variables as {
    goalId: string
    parentId: string
    version: number
  }
  const goal = devGoals.find((g) => g.id === goalId)
  if (!goal) return HttpResponse.json({ errors: [{ message: 'Goal not found' }] }, { status: 200 })
  goal.parent = { id: parentId }
  goal.version = version + 1
  goal.updatedAt = new Date().toISOString()
  return HttpResponse.json({
    data: { setGoalParent: { id: goal.id, version: goal.version, parent: goal.parent } },
  })
})

const clearGoalParentHandler = graphql.mutation('ClearGoalParent', ({ variables }) => {
  const { goalId, version } = variables as { goalId: string; version: number }
  const goal = devGoals.find((g) => g.id === goalId)
  if (!goal) return HttpResponse.json({ errors: [{ message: 'Goal not found' }] }, { status: 200 })
  goal.parent = null
  goal.version = version + 1
  goal.updatedAt = new Date().toISOString()
  return HttpResponse.json({
    data: { clearGoalParent: { id: goal.id, version: goal.version, parent: null } },
  })
})

const setParentLevelGoalHandler = graphql.mutation('SetParentLevelGoal', ({ variables }) => {
  const { goalId, parentLevelGoalId, version } = variables as {
    goalId: string
    parentLevelGoalId: string
    version: number
  }
  const goal = devGoals.find((g) => g.id === goalId)
  const parent = devGoals.find((g) => g.id === parentLevelGoalId)
  if (!goal) return HttpResponse.json({ errors: [{ message: 'Goal not found' }] }, { status: 200 })
  goal.parentLevelGoal = parent ? { id: parent.id, name: parent.name } : null
  goal.parentLevelGoalName = parent?.name ?? null
  goal.version = version + 1
  goal.updatedAt = new Date().toISOString()
  return HttpResponse.json({
    data: {
      setParentLevelGoal: {
        id: goal.id,
        version: goal.version,
        parentLevelGoal: goal.parentLevelGoal,
        parentLevelGoalName: goal.parentLevelGoalName,
      },
    },
  })
})

const clearParentLevelGoalHandler = graphql.mutation('ClearParentLevelGoal', ({ variables }) => {
  const { goalId, version } = variables as { goalId: string; version: number }
  const goal = devGoals.find((g) => g.id === goalId)
  if (!goal) return HttpResponse.json({ errors: [{ message: 'Goal not found' }] }, { status: 200 })
  goal.parentLevelGoal = null
  goal.parentLevelGoalName = null
  goal.version = version + 1
  goal.updatedAt = new Date().toISOString()
  return HttpResponse.json({
    data: {
      clearParentLevelGoal: {
        id: goal.id,
        version: goal.version,
        parentLevelGoal: null,
        parentLevelGoalName: null,
      },
    },
  })
})

const linkGoalsHandler = graphql.mutation('LinkGoals', ({ variables }) => {
  const { goalId, relatedGoalId } = variables as { goalId: string; relatedGoalId: string }
  const a = devGoals.find((g) => g.id === goalId)
  const b = devGoals.find((g) => g.id === relatedGoalId)
  if (a && b) {
    if (!a.relatedGoals.some((r) => r.id === relatedGoalId))
      a.relatedGoals.push({ id: b.id, name: b.name })
    if (!b.relatedGoals.some((r) => r.id === goalId))
      b.relatedGoals.push({ id: a.id, name: a.name })
  }
  return HttpResponse.json({ data: { linkGoals: true } })
})

const unlinkGoalsHandler = graphql.mutation('UnlinkGoals', ({ variables }) => {
  const { goalId, relatedGoalId } = variables as { goalId: string; relatedGoalId: string }
  const a = devGoals.find((g) => g.id === goalId)
  const b = devGoals.find((g) => g.id === relatedGoalId)
  if (a) a.relatedGoals = a.relatedGoals.filter((r) => r.id !== relatedGoalId)
  if (b) b.relatedGoals = b.relatedGoals.filter((r) => r.id !== goalId)
  return HttpResponse.json({ data: { unlinkGoals: true } })
})

const linkGoalToRequirementHandler = graphql.mutation('LinkGoalToRequirement', ({ variables }) => {
  const { goalId, requirementId } = variables as { goalId: string; requirementId: string }
  const goal = devGoals.find((g) => g.id === goalId)
  const req = devRequirements.find((r) => r.id === requirementId)
  if (goal && req) {
    if (!goal.linkedRequirements.some((r) => r.id === requirementId))
      goal.linkedRequirements.push({ id: req.id, name: req.name, status: req.status })
    if (!req.linkedGoals.some((g) => g.id === goalId))
      req.linkedGoals.push({ id: goal.id, name: goal.name })
  }
  return HttpResponse.json({ data: { linkGoalToRequirement: true } })
})

const unlinkGoalFromRequirementHandler = graphql.mutation(
  'UnlinkGoalFromRequirement',
  ({ variables }) => {
    const { goalId, requirementId } = variables as { goalId: string; requirementId: string }
    const goal = devGoals.find((g) => g.id === goalId)
    const req = devRequirements.find((r) => r.id === requirementId)
    if (goal)
      goal.linkedRequirements = goal.linkedRequirements.filter((r) => r.id !== requirementId)
    if (req) req.linkedGoals = req.linkedGoals.filter((g) => g.id !== goalId)
    return HttpResponse.json({ data: { unlinkGoalFromRequirement: true } })
  },
)

// ---------------------------------------------------------------------------
// Requirement handlers
// ---------------------------------------------------------------------------

const INVERSE_DEP: Record<string, string> = {
  blocks: 'blocked_by',
  blocked_by: 'blocks',
  duplicates: 'duplicated_by',
  duplicated_by: 'duplicates',
  relates_to: 'relates_to',
}

const getRequirementsHandler = graphql.query('GetRequirements', ({ variables }) => {
  const filter = (variables as { filter?: { scopeType?: string; scopeId?: string } }).filter ?? {}
  const requirements = devRequirements.filter((r) => {
    if (filter.scopeType && r.scope.type !== filter.scopeType) return false
    if (filter.scopeId && r.scope.id !== filter.scopeId) return false
    return true
  })
  return HttpResponse.json({ data: { requirements } })
})

const getRequirementHandler = graphql.query('GetRequirement', ({ variables }) => {
  const { id } = variables as { id: string }
  return HttpResponse.json({
    data: { requirement: devRequirements.find((r) => r.id === id) ?? null },
  })
})

const createRequirementHandler = graphql.mutation('CreateRequirement', ({ variables }) => {
  const { input } = variables as { input: Record<string, unknown> }
  const now = new Date().toISOString()
  const req: Requirement = {
    id: `req-${nextRequirementId++}`,
    version: 1,
    name: input.name as string,
    requirementScope: (input.requirementScope as Requirement['requirementScope']) ?? 'IN_SCOPE',
    source: (input.source as Requirement['source']) ?? null,
    estimatedEffortMin: (input.estimatedEffortMin as number | null) ?? null,
    estimatedEffortMax: (input.estimatedEffortMax as number | null) ?? null,
    type: (input.type as Requirement['type']) ?? 'FUNCTIONAL',
    priority: (input.priority as Requirement['priority']) ?? 'MUST_HAVE',
    status: (input.status as Requirement['status']) ?? 'NEW',
    description: (input.description as string | null) ?? null,
    acceptanceCriteria: (input.acceptanceCriteria as string | null) ?? null,
    createdAt: now,
    updatedAt: now,
    creator: null,
    updater: null,
    parent: null,
    scope: {
      id: input.scopeId as string,
      type: input.scopeType as 'Project' | 'Program' | 'Portfolio',
    },
    dependencies: [],
    linkedGoals: [],
  }
  devRequirements.push(req)
  return HttpResponse.json({ data: { createRequirement: req } })
})

const updateRequirementHandler = graphql.mutation('UpdateRequirement', ({ variables }) => {
  const { input } = variables as { input: Record<string, unknown> }
  const existing = devRequirements.find((r) => r.id === (input.id as string))
  if (!existing)
    return HttpResponse.json({ errors: [{ message: 'Requirement not found' }] }, { status: 200 })
  Object.assign(existing, {
    ...input,
    updatedAt: new Date().toISOString(),
    version: existing.version + 1,
  })
  return HttpResponse.json({ data: { updateRequirement: existing } })
})

const deleteRequirementHandler = graphql.mutation('DeleteRequirement', ({ variables }) => {
  const { id } = variables as { id: string; version: number; cascade: boolean }
  const idx = devRequirements.findIndex((r) => r.id === id)
  if (idx !== -1) devRequirements.splice(idx, 1)
  return HttpResponse.json({ data: { deleteRequirement: true } })
})

const setRequirementParentHandler = graphql.mutation('SetRequirementParent', ({ variables }) => {
  const { requirementId, parentId, version } = variables as {
    requirementId: string
    parentId: string
    version: number
  }
  const req = devRequirements.find((r) => r.id === requirementId)
  if (!req)
    return HttpResponse.json({ errors: [{ message: 'Requirement not found' }] }, { status: 200 })
  req.parent = { id: parentId }
  req.version = version + 1
  req.updatedAt = new Date().toISOString()
  return HttpResponse.json({
    data: { setRequirementParent: { id: req.id, version: req.version, parent: req.parent } },
  })
})

const clearRequirementParentHandler = graphql.mutation(
  'ClearRequirementParent',
  ({ variables }) => {
    const { requirementId, version } = variables as { requirementId: string; version: number }
    const req = devRequirements.find((r) => r.id === requirementId)
    if (!req)
      return HttpResponse.json({ errors: [{ message: 'Requirement not found' }] }, { status: 200 })
    req.parent = null
    req.version = version + 1
    req.updatedAt = new Date().toISOString()
    return HttpResponse.json({
      data: { clearRequirementParent: { id: req.id, version: req.version, parent: null } },
    })
  },
)

const linkRequirementsHandler = graphql.mutation('LinkRequirements', ({ variables }) => {
  const { input } = variables as { input: { fromId: string; toId: string; linkType: string } }
  const from = devRequirements.find((r) => r.id === input.fromId)
  const to = devRequirements.find((r) => r.id === input.toId)
  if (from && to) {
    if (
      !from.dependencies.some(
        (d) => d.requirement.id === input.toId && d.edgeTypeName === input.linkType,
      )
    )
      from.dependencies.push({
        edgeTypeName: input.linkType,
        requirement: { id: to.id, name: to.name, status: to.status },
      })
    const inv = INVERSE_DEP[input.linkType] ?? input.linkType
    if (!to.dependencies.some((d) => d.requirement.id === input.fromId && d.edgeTypeName === inv))
      to.dependencies.push({
        edgeTypeName: inv,
        requirement: { id: from.id, name: from.name, status: from.status },
      })
  }
  return HttpResponse.json({ data: { linkRequirements: true } })
})

const unlinkRequirementsHandler = graphql.mutation('UnlinkRequirements', ({ variables }) => {
  const { fromId, toId, linkType } = variables as { fromId: string; toId: string; linkType: string }
  const from = devRequirements.find((r) => r.id === fromId)
  const to = devRequirements.find((r) => r.id === toId)
  if (from)
    from.dependencies = from.dependencies.filter(
      (d) => !(d.requirement.id === toId && d.edgeTypeName === linkType),
    )
  const inv = INVERSE_DEP[linkType] ?? linkType
  if (to)
    to.dependencies = to.dependencies.filter(
      (d) => !(d.requirement.id === fromId && d.edgeTypeName === inv),
    )
  return HttpResponse.json({ data: { unlinkRequirements: true } })
})

// ---------------------------------------------------------------------------
// Assumption handlers
// ---------------------------------------------------------------------------

const getAssumptionsHandler = graphql.query('GetAssumptions', ({ variables }) => {
  const filter = (variables as { filter?: { scopeType?: string; scopeId?: string } }).filter ?? {}
  const assumptions = devAssumptions.filter((a) => {
    if (filter.scopeType && a.scope.type !== filter.scopeType) return false
    if (filter.scopeId && a.scope.id !== filter.scopeId) return false
    return true
  })
  return HttpResponse.json({ data: { assumptions } })
})

const getAssumptionHandler = graphql.query('GetAssumption', ({ variables }) => {
  const { id } = variables as { id: string }
  return HttpResponse.json({
    data: { assumption: devAssumptions.find((a) => a.id === id) ?? null },
  })
})

const lookupAssumptionValidationStatusHandler = graphql.query(
  'LookupAssumptionValidationStatus',
  () =>
    HttpResponse.json({
      data: {
        lookupAssumptionValidationStatus: [
          { status: 'ASSUMED', description: 'Assumed', displayOrder: 1 },
          { status: 'UNCERTAIN', description: 'Uncertain', displayOrder: 2 },
          { status: 'VALIDATED', description: 'Validated', displayOrder: 3 },
          { status: 'REFUTED', description: 'Refuted', displayOrder: 4 },
        ],
      },
    }),
)

const createAssumptionHandler = graphql.mutation('CreateAssumption', ({ variables }) => {
  const { input } = variables as { input: Record<string, unknown> }
  const now = new Date().toISOString()
  const assumption: Assumption = {
    id: `assum-${nextAssumptionId++}`,
    version: 1,
    name: input.name as string,
    description: (input.description as string | null) ?? null,
    dueDate: (input.dueDate as string | null) ?? null,
    validationStatus: (input.validationStatus as string) ?? 'ASSUMED',
    isRisk: (input.isRisk as boolean) ?? false,
    otherInformation: (input.otherInformation as string | null) ?? null,
    createdAt: now,
    updatedAt: now,
    creator: null,
    updater: null,
    validatedBy: null,
    linkedRisk: null,
    linkedRisks: [],
    projectCharter: null,
    scope: { id: input.scopeId as string, type: 'Project' },
  }
  devAssumptions.push(assumption)
  return HttpResponse.json({ data: { createAssumption: assumption } })
})

const updateAssumptionHandler = graphql.mutation('UpdateAssumption', ({ variables }) => {
  const { input } = variables as { input: Record<string, unknown> }
  const existing = devAssumptions.find((a) => a.id === (input.id as string))
  if (!existing)
    return HttpResponse.json({ errors: [{ message: 'Assumption not found' }] }, { status: 200 })
  Object.assign(existing, {
    ...input,
    updatedAt: new Date().toISOString(),
    version: existing.version + 1,
  })
  return HttpResponse.json({ data: { updateAssumption: existing } })
})

const deleteAssumptionHandler = graphql.mutation('DeleteAssumption', ({ variables }) => {
  const { id } = variables as { id: string; version: number }
  const idx = devAssumptions.findIndex((a) => a.id === id)
  if (idx !== -1) devAssumptions.splice(idx, 1)
  return HttpResponse.json({ data: { deleteAssumption: true } })
})

const linkAssumptionToRiskEntryHandler = graphql.mutation(
  'LinkAssumptionToRiskEntry',
  ({ variables }) => {
    const { assumptionId, riskEntryId } = variables as { assumptionId: string; riskEntryId: string }
    const assumption = devAssumptions.find((a) => a.id === assumptionId)
    if (assumption && !assumption.linkedRisks.some((r) => r.id === riskEntryId)) {
      assumption.linkedRisks.push({ id: riskEntryId, name: `Risk ${riskEntryId}` })
    }
    return HttpResponse.json({ data: { linkAssumptionToRiskEntry: true } })
  },
)

const unlinkAssumptionFromRiskEntryHandler = graphql.mutation(
  'UnlinkAssumptionFromRiskEntry',
  ({ variables }) => {
    const { assumptionId, riskEntryId } = variables as { assumptionId: string; riskEntryId: string }
    const assumption = devAssumptions.find((a) => a.id === assumptionId)
    if (assumption) {
      assumption.linkedRisks = assumption.linkedRisks.filter((r) => r.id !== riskEntryId)
    }
    return HttpResponse.json({ data: { unlinkAssumptionFromRiskEntry: true } })
  },
)

// ---------------------------------------------------------------------------
// Constraint handlers
// ---------------------------------------------------------------------------

const getProjectConstraintsHandler = graphql.query('GetProjectConstraints', ({ variables }) => {
  const filter = (variables as { filter?: { scopeType?: string; scopeId?: string } }).filter ?? {}
  const projectConstraints = devConstraints.filter((c) => {
    if (filter.scopeType && c.scope.type !== filter.scopeType) return false
    if (filter.scopeId && c.scope.id !== filter.scopeId) return false
    return true
  })
  return HttpResponse.json({ data: { projectConstraints } })
})

const createProjectConstraintHandler = graphql.mutation(
  'CreateProjectConstraint',
  ({ variables }) => {
    const { input } = variables as { input: Record<string, unknown> }
    const now = new Date().toISOString()
    const timeConstrained = (input.timeConstrained as boolean) ?? false
    const constraint: ProjectConstraint = {
      id: `con-${nextConstraintId++}`,
      version: 1,
      name: input.name as string,
      description: (input.description as string | null) ?? null,
      timeConstrained,
      dueDate: timeConstrained ? ((input.dueDate as string | null) ?? null) : null,
      otherInformation: (input.otherInformation as string | null) ?? null,
      createdAt: now,
      updatedAt: now,
      creator: null,
      updater: null,
      owner: null,
      projectCharter: null,
      scope: { id: input.scopeId as string, type: 'Project' },
    }
    devConstraints.push(constraint)
    return HttpResponse.json({ data: { createProjectConstraint: constraint } })
  },
)

const updateProjectConstraintHandler = graphql.mutation(
  'UpdateProjectConstraint',
  ({ variables }) => {
    const { input } = variables as { input: Record<string, unknown> }
    const existing = devConstraints.find((c) => c.id === (input.id as string))
    if (!existing)
      return HttpResponse.json({ errors: [{ message: 'Constraint not found' }] }, { status: 200 })
    Object.assign(existing, {
      ...input,
      updatedAt: new Date().toISOString(),
      version: existing.version + 1,
    })
    return HttpResponse.json({ data: { updateProjectConstraint: existing } })
  },
)

const deleteProjectConstraintHandler = graphql.mutation(
  'DeleteProjectConstraint',
  ({ variables }) => {
    const { id } = variables as { id: string; version: number }
    const idx = devConstraints.findIndex((c) => c.id === id)
    if (idx !== -1) devConstraints.splice(idx, 1)
    return HttpResponse.json({ data: { deleteProjectConstraint: true } })
  },
)

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/** MSW handlers for all planning-objects GraphQL operations (goals, requirements, assumptions, constraints). */
export const planningObjectsHandlers = [
  // Goals
  getGoalsHandler,
  getGoalHandler,
  createGoalHandler,
  updateGoalHandler,
  deleteGoalHandler,
  setGoalParentHandler,
  clearGoalParentHandler,
  setParentLevelGoalHandler,
  clearParentLevelGoalHandler,
  linkGoalsHandler,
  unlinkGoalsHandler,
  linkGoalToRequirementHandler,
  unlinkGoalFromRequirementHandler,
  // Requirements
  getRequirementsHandler,
  getRequirementHandler,
  createRequirementHandler,
  updateRequirementHandler,
  deleteRequirementHandler,
  setRequirementParentHandler,
  clearRequirementParentHandler,
  linkRequirementsHandler,
  unlinkRequirementsHandler,
  // Assumptions
  getAssumptionsHandler,
  getAssumptionHandler,
  lookupAssumptionValidationStatusHandler,
  createAssumptionHandler,
  updateAssumptionHandler,
  deleteAssumptionHandler,
  linkAssumptionToRiskEntryHandler,
  unlinkAssumptionFromRiskEntryHandler,
  // Constraints
  getProjectConstraintsHandler,
  createProjectConstraintHandler,
  updateProjectConstraintHandler,
  deleteProjectConstraintHandler,
]
