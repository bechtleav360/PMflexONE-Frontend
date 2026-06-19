import { Route } from 'react-router-dom'

import {
  BusinessCaseDetailPage,
  BusinessCaseNewPage,
  DashboardPage,
  DocumentsPage,
  HomePage,
  MessagesPage,
  NotFoundPage,
  PermissionsPage,
  PortfolioDetailPage,
  PortfolioGoalsPage,
  PortfolioIssueManagementPage,
  PortfolioMembersPage,
  PortfolioProblemManagementPage,
  PortfolioRiskManagementPage,
  PortfoliosPage,
  PortfolioTaskManagementPage,
  ProfilePage,
  ProgramDetailPage,
  ProgramGoalsPage,
  ProgramIssueManagementPage,
  ProgramMembersPage,
  ProgramProblemManagementPage,
  ProgramRiskManagementPage,
  ProgramsPage,
  ProgramTaskManagementPage,
  ProjectAssumptionsPage,
  ProjectCharterDetailPage,
  ProjectCharterNewPage,
  ProjectConstraintsPage,
  ProjectDeliverablesPage,
  ProjectDetailPage,
  ProjectGoalsPage,
  ProjectInitiationRequestDetailPage,
  ProjectInitiationRequestsPage,
  ProjectIssueManagementPage,
  ProjectMembersPage,
  ProjectPlanningRolesPage,
  ProjectProblemManagementPage,
  ProjectRequirementsPage,
  ProjectRiskManagementPage,
  ProjectsPage,
  ProjectSupportServicesPage,
  ProjectTaskManagementPage,
  RasciMatrixPage,
  ReportsPage,
  RoleManagementDetailPage,
  RoleManagementPage,
  SettingsPage,
  StakeholderRegisterPage,
  UsersPage,
} from './lazyPages'

/** General top-level routes (home, shared utilities, user settings). */
export const generalRoutes = (
  <>
    <Route
      path="/"
      element={<HomePage />}
    />
    <Route
      path="/dashboard"
      element={<DashboardPage />}
    />
    <Route
      path="/documents"
      element={<DocumentsPage />}
    />
    <Route
      path="/reports"
      element={<ReportsPage />}
    />
    <Route
      path="/messages"
      element={<MessagesPage />}
    />
    <Route
      path="/users"
      element={<UsersPage />}
    />
    <Route
      path="/profile"
      element={<ProfilePage />}
    />
    <Route
      path="/permissions"
      element={<PermissionsPage />}
    />
    <Route
      path="/settings"
      element={<SettingsPage />}
    />
  </>
)

/** Project-scoped routes. */
export const projectRoutes = (
  <>
    <Route
      path="/projects"
      element={<ProjectsPage />}
    />
    <Route
      path="/projects/:id"
      element={<ProjectDetailPage />}
    />
    <Route
      path="/projects/:id/risk-management"
      element={<ProjectRiskManagementPage />}
    />
    <Route
      path="/projects/:id/issue-management"
      element={<ProjectIssueManagementPage />}
    />
    <Route
      path="/projects/:id/problem-management"
      element={<ProjectProblemManagementPage />}
    />
    <Route
      path="/projects/:id/tasks"
      element={<ProjectTaskManagementPage />}
    />
    <Route
      path="/projects/:id/deliverables"
      element={<ProjectDeliverablesPage />}
    />
    <Route
      path="/projects/:id/deliverables/list"
      element={<ProjectDeliverablesPage />}
    />
    <Route
      path="/projects/:id/support-services"
      element={<ProjectSupportServicesPage />}
    />
    <Route
      path="/projects/:id/support-services/list"
      element={<ProjectSupportServicesPage />}
    />
    <Route
      path="/projects/:id/planning-roles"
      element={<ProjectPlanningRolesPage />}
    />
    <Route
      path="/projects/:id/projectmember"
      element={<ProjectMembersPage />}
    />
    <Route
      path="/projects/:id/goals"
      element={<ProjectGoalsPage />}
    />
    <Route
      path="/projects/:id/requirements"
      element={<ProjectRequirementsPage />}
    />
    <Route
      path="/projects/:id/assumptions"
      element={<ProjectAssumptionsPage />}
    />
    <Route
      path="/projects/:id/constraints"
      element={<ProjectConstraintsPage />}
    />
    <Route
      path="/projects/:id/stakeholder-management"
      element={<StakeholderRegisterPage />}
    />
  </>
)

/** Portfolio-scoped routes. */
export const portfolioRoutes = (
  <>
    <Route
      path="/portfolios"
      element={<PortfoliosPage />}
    />
    <Route
      path="/portfolios/:id"
      element={<PortfolioDetailPage />}
    />
    <Route
      path="/portfolios/:id/risk-management"
      element={<PortfolioRiskManagementPage />}
    />
    <Route
      path="/portfolios/:id/issue-management"
      element={<PortfolioIssueManagementPage />}
    />
    <Route
      path="/portfolios/:id/problem-management"
      element={<PortfolioProblemManagementPage />}
    />
    <Route
      path="/portfolios/:id/tasks"
      element={<PortfolioTaskManagementPage />}
    />
    <Route
      path="/portfolios/:id/projectmember"
      element={<PortfolioMembersPage />}
    />
    <Route
      path="/portfolios/:id/goals"
      element={<PortfolioGoalsPage />}
    />
    <Route
      path="/portfolios/:id/stakeholder-management"
      element={<StakeholderRegisterPage scopeType="Portfolio" />}
    />
  </>
)

/** Program-scoped routes. */
export const programRoutes = (
  <>
    <Route
      path="/programs"
      element={<ProgramsPage />}
    />
    <Route
      path="/programs/:id"
      element={<ProgramDetailPage />}
    />
    <Route
      path="/programs/:id/risk-management"
      element={<ProgramRiskManagementPage />}
    />
    <Route
      path="/programs/:id/issue-management"
      element={<ProgramIssueManagementPage />}
    />
    <Route
      path="/programs/:id/problem-management"
      element={<ProgramProblemManagementPage />}
    />
    <Route
      path="/programs/:id/tasks"
      element={<ProgramTaskManagementPage />}
    />
    <Route
      path="/programs/:id/projectmember"
      element={<ProgramMembersPage />}
    />
    <Route
      path="/programs/:id/goals"
      element={<ProgramGoalsPage />}
    />
    <Route
      path="/programs/:id/stakeholder-management"
      element={<StakeholderRegisterPage scopeType="Program" />}
    />
  </>
)

/** Document and initiation routes. */
export const documentRoutes = (
  <>
    <Route
      path="/:objectType/:objectId/rasci"
      element={<RasciMatrixPage />}
    />
    <Route
      path="/initiation-requests"
      element={<ProjectInitiationRequestsPage />}
    />
    <Route
      path="/initiation-requests/:id"
      element={<ProjectInitiationRequestDetailPage />}
    />
    <Route
      path="/business-cases/new"
      element={<BusinessCaseNewPage />}
    />
    <Route
      path="/business-cases/:id"
      element={<BusinessCaseDetailPage />}
    />
    <Route
      path="/project-charters/new"
      element={<ProjectCharterNewPage />}
    />
    <Route
      path="/project-charters/:id"
      element={<ProjectCharterDetailPage />}
    />
  </>
)

/** Admin-only routes. */
export const adminRoutes = (
  <>
    <Route
      path="/admin/role-management"
      element={<RoleManagementPage />}
    />
    <Route
      path="/admin/role-management/:matrixId"
      element={<RoleManagementDetailPage />}
    />
  </>
)

/** Catch-all 404 route. */
export const notFoundRoute = (
  <Route
    path="*"
    element={<NotFoundPage />}
  />
)
