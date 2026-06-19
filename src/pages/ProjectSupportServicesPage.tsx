import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { useGetProject } from '@/entities/project'
import {
  DeleteSupportServiceDialog,
  FirstChildWarningDialog,
  SupportServiceFormDialog,
  SupportServiceListView,
  SupportServiceTreeView,
  SupportServiceViewToggle,
  useSupportServiceReorder,
  useSupportServiceTree,
  type SupportServiceViewTab,
} from '@/features/support-services-management'
import { Alert, AlertDescription } from '@/shared/components'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'

/**
 * Project-scoped support services page.
 *
 * Renders a view toggle (shadcn Tabs) to switch between the hierarchical tree
 * view and the flat list view. Create/edit operations are handled via
 * `SupportServiceFormDialog` (modal dialog driven by `useSupportServicesUiStore`).
 * Delete operations are handled via `DeleteSupportServiceDialog`.
 * First-child warnings are handled via `FirstChildWarningDialog`.
 * Drag-and-drop and keyboard reorder are delegated to `useSupportServiceReorder`.
 *
 * @returns The rendered support services page.
 */
export function ProjectSupportServicesPage() {
  const { t } = useTranslation()
  const { id: projectId = '' } = useParams<{ id: string }>()
  const { data: project } = useGetProject(projectId)
  const location = useLocation()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<SupportServiceViewTab>(
    location.pathname.endsWith('/list') ? 'list' : 'tree',
  )

  function handleTabChange(tab: SupportServiceViewTab) {
    setActiveTab(tab)
    void navigate(`/projects/${projectId}/support-services${tab === 'list' ? '/list' : ''}`, {
      replace: true,
    })
  }

  const { data: treeData } = useSupportServiceTree(projectId)
  const flat = useMemo(() => treeData?.flat ?? [], [treeData?.flat])

  // TODO(Phase 9 RBAC): replace with real permission check once the RBAC layer ships.
  const canWrite = true

  const { handleMoveUp, handleMoveDown, handleDragEnd, moveAnnouncement } =
    useSupportServiceReorder(projectId, flat)

  return (
    <PageContent variant={activeTab === 'tree' ? 'scrollable' : 'full-height'}>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <Link
          to="/projects"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          {t('pages.projects.title')}
        </Link>
        <span
          className="text-muted-foreground"
          aria-hidden="true"
        >
          {CRUMB_SEP}
        </span>
        <Link
          to={`/projects/${projectId}`}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          {project?.name ?? projectId}
        </Link>
        <span
          className="text-muted-foreground"
          aria-hidden="true"
        >
          {CRUMB_SEP}
        </span>
        <span className="text-sm font-medium">
          {t('features.supportServicesManagement.pageTitle')}
        </span>
      </div>

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {t('features.supportServicesManagement.pageTitle')}
        </h1>
        <SupportServiceViewToggle
          value={activeTab}
          onChange={handleTabChange}
        />
      </div>

      {/* Register notice: distinguish support services from outsourcing (FR-017) */}
      <Alert className="mb-4">
        <AlertDescription>{t('features.supportServicesManagement.headerNotice')}</AlertDescription>
      </Alert>

      {/* Views */}
      {activeTab === 'tree' ? (
        <SupportServiceTreeView
          projectId={projectId}
          canWrite={canWrite}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onDragEnd={handleDragEnd}
          moveAnnouncement={moveAnnouncement}
        />
      ) : (
        <SupportServiceListView
          projectId={projectId}
          canWrite={canWrite}
        />
      )}

      {/* Dialogs (always mounted, open state from store) */}
      <DeleteSupportServiceDialog projectId={projectId} />
      <FirstChildWarningDialog />
      <SupportServiceFormDialog projectId={projectId} />
    </PageContent>
  )
}
