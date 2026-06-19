import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { Matrix, MatrixRole, MatrixTask, RoleGroup, TaskGroup } from '@/entities/role'
import { useMatrix, useTaskGroups } from '@/entities/role'
import { Button, Skeleton } from '@/shared/components'
import { groupColorStyles } from '@/shared/lib/groupColor'

const GROUP_CLASS_COUNT = 6

function groupPaletteClass(index: number) {
  return `rasci-group-header-${index % GROUP_CLASS_COUNT}`
}

function fmtGroupLabel(name: string, count: number) {
  return `${name} (${count})`
}

type CardT = ReturnType<typeof useTranslation>['t']

function renderRoleGroupBadges(
  sortedRoleGroups: RoleGroup[],
  detail: { roles: MatrixRole[] } | null | undefined,
  t: CardT,
) {
  if (sortedRoleGroups.length === 0) return null
  return (
    <div className="space-y-1.5 pt-1">
      <p className="text-foreground/70 text-xs font-semibold tracking-wider uppercase">
        {t('pages.roleManagement.cardRoleGroupsLabel')}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {sortedRoleGroups.map((group, idx) => {
          const count = (detail?.roles ?? []).filter(
            (r: MatrixRole) => r.groupId === group.id,
          ).length
          const { header: headerStyle } = groupColorStyles(group.color)
          return (
            <span
              key={group.id}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold${headerStyle ? '' : ` ${groupPaletteClass(idx)}`}`}
              style={headerStyle}
            >
              {fmtGroupLabel(group.name, count)}
            </span>
          )
        })}
      </div>
    </div>
  )
}

interface MatrixCardProps {
  matrix: Matrix
  Icon: React.ElementType
  label: string
  roleGroups: RoleGroup[]
  to?: string
}

/**
 * Card summary for a single RASCI template matrix.
 * Shows the domain icon, label, role groups, and task groups fetched from the matrix detail.
 * Renders loading skeletons while data is pending.
 *
 * @param props - Card configuration.
 * @returns The rendered matrix card.
 */
export function MatrixCard({ matrix, Icon, label, roleGroups, to }: MatrixCardProps) {
  const { t } = useTranslation()

  const { data: detail, isPending } = useMatrix(
    { matrixId: matrix.id },
    { staleTime: 5 * 60 * 1000 },
  )

  const { data: taskGroups = [] } = useTaskGroups()

  const sortedRoleGroups = roleGroups
    .filter((g) => detail?.roles.some((r: MatrixRole) => r.groupId === g.id))
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const taskGroupIds = new Set(
    (detail?.tasks ?? [])
      .map((task: MatrixTask) => task.groupId)
      .filter((id): id is string => id !== null),
  )

  const sortedTaskGroups = taskGroups
    .filter((g: TaskGroup) => taskGroupIds.has(g.id))
    .sort((a: TaskGroup, b: TaskGroup) => a.sortOrder - b.sortOrder)

  return (
    <div className="bg-card flex h-full flex-col rounded-xl border shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-base font-semibold">{label}</span>
      </div>

      <div className="min-h-[64px] space-y-2 px-5 pb-4">
        {isPending ? (
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-3/4 rounded-full" />
            <Skeleton className="h-5 w-1/2 rounded-full" />
          </div>
        ) : (
          <>
            {renderRoleGroupBadges(sortedRoleGroups, detail, t)}

            {sortedTaskGroups.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-foreground/70 text-xs font-semibold tracking-wider uppercase">
                  {t('pages.roleManagement.cardTaskGroupsLabel')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {sortedTaskGroups.map((group: TaskGroup) => {
                    const count = (detail?.tasks ?? []).filter(
                      (task: MatrixTask) => task.groupId === group.id,
                    ).length
                    return (
                      <span
                        key={group.id}
                        className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                      >
                        {fmtGroupLabel(group.name, count)}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-auto border-t px-4 py-3">
        <Button
          asChild
          variant="ghost"
          className="w-full justify-between"
          aria-label={`${t('pages.roleManagement.openMatrix')}: ${label}`}
        >
          <Link to={to ?? `/admin/role-management/${matrix.id}`}>
            {t('pages.roleManagement.openMatrix')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
