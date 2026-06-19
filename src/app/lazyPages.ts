/* eslint-disable jsdoc/require-jsdoc -- lazy route factories are implementation details, not public API */
import { lazy } from 'react'

export const HomePage = lazy(async () => ({
  default: (await import('@/pages/HomePage')).HomePage,
}))

export const DashboardPage = lazy(async () => ({
  default: (await import('@/pages/DashboardPage')).DashboardPage,
}))

export const DocumentsPage = lazy(async () => ({
  default: (await import('@/pages/DocumentsPage')).DocumentsPage,
}))

export const ReportsPage = lazy(async () => ({
  default: (await import('@/pages/ReportsPage')).ReportsPage,
}))

export const MessagesPage = lazy(async () => ({
  default: (await import('@/pages/MessagesPage')).MessagesPage,
}))

export const UsersPage = lazy(async () => ({
  default: (await import('@/pages/UsersPage')).UsersPage,
}))

export const ProfilePage = lazy(async () => ({
  default: (await import('@/pages/ProfilePage')).ProfilePage,
}))

export const PermissionsPage = lazy(async () => ({
  default: (await import('@/pages/PermissionsPage')).PermissionsPage,
}))

export const SettingsPage = lazy(async () => ({
  default: (await import('@/pages/SettingsPage')).SettingsPage,
}))

export const ProjectsPage = lazy(async () => ({
  default: (await import('@/pages/ProjectsPage')).ProjectsPage,
}))

export const ProjectDetailPage = lazy(async () => ({
  default: (await import('@/pages/ProjectDetailPage')).ProjectDetailPage,
}))

export const PortfoliosPage = lazy(async () => ({
  default: (await import('@/pages/PortfoliosPage')).PortfoliosPage,
}))

export const PortfolioDetailPage = lazy(async () => ({
  default: (await import('@/pages/PortfolioDetailPage')).PortfolioDetailPage,
}))

export const ProgramsPage = lazy(async () => ({
  default: (await import('@/pages/ProgramsPage')).ProgramsPage,
}))

export const ProgramDetailPage = lazy(async () => ({
  default: (await import('@/pages/ProgramDetailPage')).ProgramDetailPage,
}))

export const ProjectInitiationRequestsPage = lazy(async () => ({
  default: (await import('@/pages/ProjectInitiationRequestsPage')).ProjectInitiationRequestsPage,
}))

export const ProjectInitiationRequestDetailPage = lazy(async () => ({
  default: (await import('@/pages/ProjectInitiationRequestDetailPage'))
    .ProjectInitiationRequestDetailPage,
}))

export const BusinessCaseNewPage = lazy(async () => ({
  default: (await import('@/pages/BusinessCaseNewPage')).BusinessCaseNewPage,
}))

export const BusinessCaseDetailPage = lazy(async () => ({
  default: (await import('@/pages/BusinessCaseDetailPage')).BusinessCaseDetailPage,
}))

export const ProjectCharterNewPage = lazy(async () => ({
  default: (await import('@/pages/ProjectCharterNewPage')).ProjectCharterNewPage,
}))

export const ProjectCharterDetailPage = lazy(async () => ({
  default: (await import('@/pages/ProjectCharterDetailPage')).ProjectCharterDetailPage,
}))

export const PortfolioRiskManagementPage = lazy(async () => ({
  default: (await import('@/pages/PortfolioRiskManagementPage')).PortfolioRiskManagementPage,
}))

export const PortfolioIssueManagementPage = lazy(async () => ({
  default: (await import('@/pages/PortfolioIssueManagementPage')).PortfolioIssueManagementPage,
}))

export const PortfolioProblemManagementPage = lazy(async () => ({
  default: (await import('@/pages/PortfolioProblemManagementPage')).PortfolioProblemManagementPage,
}))

export const ProjectRiskManagementPage = lazy(async () => ({
  default: (await import('@/pages/ProjectRiskManagementPage')).ProjectRiskManagementPage,
}))

export const ProjectIssueManagementPage = lazy(async () => ({
  default: (await import('@/pages/ProjectIssueManagementPage')).ProjectIssueManagementPage,
}))

export const ProjectTaskManagementPage = lazy(async () => ({
  default: (await import('@/pages/ProjectTaskManagementPage')).ProjectTaskManagementPage,
}))

export const ProgramTaskManagementPage = lazy(async () => ({
  default: (await import('@/pages/ProgramTaskManagementPage')).ProgramTaskManagementPage,
}))

export const ProgramRiskManagementPage = lazy(async () => ({
  default: (await import('@/pages/ProgramRiskManagementPage')).ProgramRiskManagementPage,
}))

export const ProgramIssueManagementPage = lazy(async () => ({
  default: (await import('@/pages/ProgramIssueManagementPage')).ProgramIssueManagementPage,
}))

export const ProgramProblemManagementPage = lazy(async () => ({
  default: (await import('@/pages/ProgramProblemManagementPage')).ProgramProblemManagementPage,
}))

export const PortfolioTaskManagementPage = lazy(async () => ({
  default: (await import('@/pages/PortfolioTaskManagementPage')).PortfolioTaskManagementPage,
}))

export const ProjectProblemManagementPage = lazy(async () => ({
  default: (await import('@/pages/ProjectProblemManagementPage')).ProjectProblemManagementPage,
}))

export const ProjectMembersPage = lazy(async () => ({
  default: (await import('@/pages/project-members')).ProjectMembersPage,
}))

export const PortfolioMembersPage = lazy(async () => ({
  default: (await import('@/pages/portfolio-members')).PortfolioMembersPage,
}))

export const ProgramMembersPage = lazy(async () => ({
  default: (await import('@/pages/program-members')).ProgramMembersPage,
}))

export const RasciMatrixPage = lazy(async () => ({
  default: (await import('@/pages/rasci-matrix')).RasciMatrixPage,
}))

export const RoleManagementPage = lazy(async () => ({
  default: (await import('@/pages/role-management')).RoleManagementPage,
}))

export const RoleManagementDetailPage = lazy(async () => ({
  default: (await import('@/pages/role-management-detail')).RoleManagementDetailPage,
}))

export const ProjectGoalsPage = lazy(async () => ({
  default: (await import('@/pages/ProjectGoalsPage')).ProjectGoalsPage,
}))

export const ProjectRequirementsPage = lazy(async () => ({
  default: (await import('@/pages/ProjectRequirementsPage')).ProjectRequirementsPage,
}))

export const ProjectAssumptionsPage = lazy(async () => ({
  default: (await import('@/pages/ProjectAssumptionsPage')).ProjectAssumptionsPage,
}))

export const ProjectConstraintsPage = lazy(async () => ({
  default: (await import('@/pages/ProjectConstraintsPage')).ProjectConstraintsPage,
}))

export const ProgramGoalsPage = lazy(async () => ({
  default: (await import('@/pages/ProgramGoalsPage')).ProgramGoalsPage,
}))

export const PortfolioGoalsPage = lazy(async () => ({
  default: (await import('@/pages/PortfolioGoalsPage')).PortfolioGoalsPage,
}))

export const ProjectDeliverablesPage = lazy(async () => ({
  default: (await import('@/pages/ProjectDeliverablesPage')).ProjectDeliverablesPage,
}))

export const ProjectSupportServicesPage = lazy(async () => ({
  default: (await import('@/pages/ProjectSupportServicesPage')).ProjectSupportServicesPage,
}))

export const ProjectPlanningRolesPage = lazy(async () => ({
  default: (await import('@/pages/ProjectPlanningRolesPage')).ProjectPlanningRolesPage,
}))

export const StakeholderRegisterPage = lazy(async () => ({
  default: (await import('@/pages/StakeholderRegisterPage')).StakeholderRegisterPage,
}))

export const NotFoundPage = lazy(async () => ({
  default: (await import('@/pages/NotFoundPage')).NotFoundPage,
}))
