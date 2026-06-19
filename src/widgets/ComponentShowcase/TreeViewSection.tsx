import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { TreeView, TreeViewNode, type TreeNodeBase } from '@/shared/components'

import { ShowcaseSection } from './ShowcaseSection'

const DEMO_NODES: TreeNodeBase[] = [
  {
    id: 'design',
    childNodes: [
      { id: 'design.wireframes', childNodes: [] },
      { id: 'design.prototypes', childNodes: [] },
    ],
  },
  {
    id: 'development',
    childNodes: [
      {
        id: 'development.frontend',
        childNodes: [
          { id: 'development.frontend.components', childNodes: [] },
          { id: 'development.frontend.pages', childNodes: [] },
        ],
      },
      { id: 'development.backend', childNodes: [] },
    ],
  },
  {
    id: 'testing',
    childNodes: [
      { id: 'testing.unit', childNodes: [] },
      { id: 'testing.e2e', childNodes: [] },
    ],
  },
]

const LABELS: Record<string, string> = {
  design: 'Design',
  'design.wireframes': 'Wireframes',
  'design.prototypes': 'Prototypes',
  development: 'Development',
  'development.frontend': 'Frontend',
  'development.frontend.components': 'Components',
  'development.frontend.pages': 'Pages',
  'development.backend': 'Backend',
  testing: 'Testing',
  'testing.unit': 'Unit Tests',
  'testing.e2e': 'E2E Tests',
}

/**
 * Showcase section for the `TreeView` and `TreeViewNode` shared components.
 *
 * @returns Two examples: an interactive expanded tree and a loading skeleton.
 */
export function TreeViewSection() {
  const { t } = useTranslation()
  const [expandedIds, setExpandedIds] = useState(new Set(['design', 'development']))

  function toggle(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <ShowcaseSection title={t('showcase.treeView.title')}>
      <div className="space-y-lg w-full basis-full">
        <p className="text-muted-foreground text-sm">{t('showcase.treeView.description')}</p>

        <div className="gap-xl grid grid-cols-2">
          {/* Interactive tree */}
          <div>
            <TreeView
              nodes={DEMO_NODES}
              expandedIds={expandedIds}
              ariaLabel={t('showcase.treeView.ariaLabel')}
              renderRow={(node, level, posInSet, setSize) => (
                <TreeViewNode
                  nodeId={node.id}
                  level={level}
                  posInSet={posInSet}
                  setSize={setSize}
                  hasChildren={node.childNodes.length > 0}
                  isExpanded={expandedIds.has(node.id)}
                  onToggleExpand={() => toggle(node.id)}
                  dragHandleLabel={t('showcase.treeView.dragHandle')}
                  expandLabel={t('showcase.treeView.expand')}
                  collapseLabel={t('showcase.treeView.collapse')}
                  renderRow={() => (
                    <span className="truncate text-sm">{LABELS[node.id] ?? node.id}</span>
                  )}
                />
              )}
            />
          </div>

          {/* Loading state */}
          <div>
            <TreeView
              nodes={[]}
              expandedIds={new Set()}
              ariaLabel={t('showcase.treeView.loadingLabel')}
              isLoading
              renderRow={() => null}
            />
          </div>
        </div>
      </div>
    </ShowcaseSection>
  )
}
