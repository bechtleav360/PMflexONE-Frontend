import { useTranslation } from 'react-i18next'

import { Tabs, TabsList, TabsTrigger } from '@/shared/components'

/** The active view tab — either the hierarchical tree or the flat list. */
export type DeliverableViewTab = 'tree' | 'list'

interface DeliverableViewToggleProps {
  value: DeliverableViewTab
  onChange: (value: DeliverableViewTab) => void
}

/**
 * Tab bar for switching between the tree and list views.
 *
 * Renders a shadcn `Tabs` component with "Tree" and "List" triggers.
 * The parent controls the active tab via `value` and `onChange`.
 *
 * @param props - Component props.
 * @param props.value - The currently active tab.
 * @param props.onChange - Called with the new tab value when the user switches.
 * @returns The rendered tab toggle bar.
 */
export function DeliverableViewToggle({ value, onChange }: DeliverableViewToggleProps) {
  const { t } = useTranslation()

  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as DeliverableViewTab)}
    >
      <TabsList>
        <TabsTrigger value="tree">{t('features.deliverablesManagement.tabs.tree')}</TabsTrigger>
        <TabsTrigger value="list">{t('features.deliverablesManagement.tabs.list')}</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
