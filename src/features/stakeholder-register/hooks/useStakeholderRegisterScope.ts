import { useTranslation } from 'react-i18next'

import { useGetPortfolios } from '@/entities/portfolio'
import { useGetProgram } from '@/entities/program'
import { useGetProject } from '@/entities/project'
import type { ScopeType } from '@/shared/types/scopeType'

/** Navigation metadata resolved for the stakeholder register breadcrumb. */
export interface StakeholderRegisterScopeResult {
  /** Translated label for the parent list navigation link (e.g. "Projects"). */
  parentListLabel: string
  /** Route path to the parent list page. */
  parentListLink: string
  /** Route path to the parent entity detail page. */
  parentLink: string
  /** Display name of the parent entity (falls back to scopeId while loading). */
  parentName: string
}

type ScopeStatics = { labelKey: string; listLink: string; linkBase: string }

const SCOPE_STATICS: Record<ScopeType, ScopeStatics> = {
  Program: { labelKey: 'nav.programs', listLink: '/programs', linkBase: '/programs' },
  Portfolio: { labelKey: 'nav.portfolios', listLink: '/portfolios', linkBase: '/portfolios' },
  Project: { labelKey: 'nav.projects', listLink: '/projects', linkBase: '/projects' },
}

function resolveParentName(
  scopeType: ScopeType,
  scopeId: string,
  programName: string | undefined,
  portfolios: Array<{ id: string; name: string }>,
  projectName: string | undefined,
): string {
  if (scopeType === 'Program') return programName ?? scopeId
  if (scopeType === 'Portfolio') return portfolios.find((p) => p.id === scopeId)?.name ?? scopeId
  return projectName ?? scopeId
}

/**
 * Resolves navigation metadata for the stakeholder register breadcrumb
 * based on the active scope type and scope ID.
 *
 * @param scopeType - The type of scope (Project, Program, Portfolio).
 * @param scopeId - The ID of the scope.
 * @returns Labels and links for the breadcrumb navigation.
 */
export function useStakeholderRegisterScope(
  scopeType: ScopeType,
  scopeId: string,
): StakeholderRegisterScopeResult {
  const { t } = useTranslation()

  const projectQuery = useGetProject(scopeType === 'Project' ? scopeId : null)
  const programQuery = useGetProgram(scopeType === 'Program' ? scopeId : null)
  const { data: portfolios = [] } = useGetPortfolios({ enabled: scopeType === 'Portfolio' })

  const { labelKey, listLink, linkBase } = SCOPE_STATICS[scopeType]

  return {
    parentListLabel: t(labelKey),
    parentListLink: listLink,
    parentLink: `${linkBase}/${scopeId}`,
    parentName: resolveParentName(
      scopeType,
      scopeId,
      programQuery.data?.name,
      portfolios,
      projectQuery.data?.name,
    ),
  }
}
