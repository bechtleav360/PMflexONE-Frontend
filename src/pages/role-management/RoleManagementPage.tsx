import { Briefcase, FolderKanban, Layers, Plus, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { DomainType } from '@/entities/role'
import { DeleteGovernanceGroupDialog, GovernanceGroupDialog } from '@/features/role-management'
import { Button, Skeleton } from '@/shared/components'
import { PageContent } from '@/widgets/Layout'

import { MatrixCard } from './MatrixCard'
import { RoleGroupsTable } from './RoleGroupsTable'
import { useRoleManagementPage } from './useRoleManagementPage'

const DOMAIN_ICON: Record<DomainType, React.ElementType> = {
  PORTFOLIO: Briefcase,
  PROGRAM: Layers,
  PROJECT: FolderKanban,
  ADMIN: Settings,
}

/**
 * Overview page for role management.
 * Lists all template matrices as cards and manages role groups via a table with CRUD dialogs.
 *
 * @returns The rendered role management page.
 */
export function RoleManagementPage() {
  const { t } = useTranslation()
  const {
    roleGroups,
    templateMatrices,
    isLoading,
    editingGroup,
    deletingGroup,
    isAddGroupOpen,
    isEditGroupOpen,
    isDeleteGroupOpen,
    openAddGroup,
    openEditGroup,
    openDeleteGroup,
  } = useRoleManagementPage()

  return (
    <PageContent className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">{t('pages.roleManagement.title')}</h1>

      {/* ── Template Matrices ─────────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">{t('pages.roleManagement.matrixSection')}</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton
                key={n}
                className="h-36 w-full rounded-xl"
              />
            ))}
          </div>
        ) : templateMatrices.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('pages.roleManagement.noGroups')}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {templateMatrices.map((matrix) => {
              const Icon = DOMAIN_ICON[matrix.domainType] ?? Settings
              const label = t(
                `pages.roleManagement.domainType.${matrix.domainType}`,
                matrix.domainType,
              )
              return (
                <li key={matrix.id}>
                  <MatrixCard
                    matrix={matrix}
                    Icon={Icon}
                    label={label}
                    roleGroups={roleGroups ?? []}
                  />
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* ── Role Groups ───────────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('pages.roleManagement.groupSection')}</h2>
          <Button
            type="button"
            onClick={openAddGroup}
          >
            <Plus
              className="mr-1 h-4 w-4"
              aria-hidden="true"
            />
            {t('pages.roleManagement.addGroup')}
          </Button>
        </div>
        <RoleGroupsTable
          roleGroups={roleGroups}
          isLoading={isLoading}
          onEdit={openEditGroup}
          onDelete={openDeleteGroup}
        />
      </section>

      {/* ── Dialogs ───────────────────────────────────────────────────── */}
      <GovernanceGroupDialog
        open={isAddGroupOpen}
        group={null}
      />
      <GovernanceGroupDialog
        open={isEditGroupOpen}
        group={editingGroup}
      />
      <DeleteGovernanceGroupDialog
        open={isDeleteGroupOpen}
        group={deletingGroup}
      />
    </PageContent>
  )
}
