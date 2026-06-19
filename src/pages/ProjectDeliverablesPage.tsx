import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { useGetProject } from '@/entities/project'
import {
  DeleteDeliverableDialog,
  DeliverableFormModal,
  DeliverableListView,
  DeliverableTreeView,
  DeliverableViewToggle,
  useDeliverableReorder,
  useDeliverableTree,
  type DeliverableViewTab,
} from '@/features/deliverables-management'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'

/**
 * Project-scoped deliverables page.
 *
 * Renders a view toggle (shadcn Tabs) to switch between the hierarchical tree
 * view and the flat list view. CRUD operations are handled via `DeliverableFormModal`
 * and `DeleteDeliverableDialog`. Drag-and-drop and keyboard reorder are
 * delegated to `useDeliverableReorder`.
 *
 * @returns The rendered deliverables page.
 */
export function ProjectDeliverablesPage() {
  const { t } = useTranslation()
  const { id: projectId = '' } = useParams<{ id: string }>()
  const { data: project } = useGetProject(projectId)
  const location = useLocation()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<DeliverableViewTab>(
    location.pathname.endsWith('/list') ? 'list' : 'tree',
  )

  function handleTabChange(tab: DeliverableViewTab) {
    setActiveTab(tab)
    navigate(`/projects/${projectId}/deliverables${tab === 'list' ? '/list' : ''}`, {
      replace: true,
    })
  }

  const { data: treeData } = useDeliverableTree(projectId)
  const flat = useMemo(() => treeData?.flat ?? [], [treeData?.flat])

  // TODO(Phase 9 RBAC): replace with real permission check once the RBAC layer ships.
  // Tracked in the Phase 9 polish work item — do not let this drift further.
  const canWrite = true

  const { handleMoveUp, handleMoveDown, handleDragEnd, moveAnnouncement } = useDeliverableReorder(
    projectId,
    flat,
  )

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
          {t('features.deliverablesManagement.pageTitle')}
        </span>
      </div>

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('features.deliverablesManagement.pageTitle')}</h1>
        <DeliverableViewToggle
          value={activeTab}
          onChange={handleTabChange}
        />
      </div>

      {/* Views */}
      {activeTab === 'tree' ? (
        <DeliverableTreeView
          projectId={projectId}
          canWrite={canWrite}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onDragEnd={handleDragEnd}
          moveAnnouncement={moveAnnouncement}
        />
      ) : (
        <DeliverableListView
          projectId={projectId}
          canWrite={canWrite}
        />
      )}

      {/* Modals (always mounted, open state from store) */}
      <DeliverableFormModal projectId={projectId} />
      <DeleteDeliverableDialog projectId={projectId} />
    </PageContent>
  )
}
