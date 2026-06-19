import { useTranslation } from 'react-i18next'

import { Tabs, TabsList, TabsTrigger } from '@/shared/components'

/** The active view tab — either the hierarchical tree or the flat list. */
export type SupportServiceViewTab = 'tree' | 'list'

interface SupportServiceViewToggleProps {
  value: SupportServiceViewTab
  onChange: (value: SupportServiceViewTab) => void
}

/**
 * Tab bar for switching between the tree and list views for support services.
 *
 * Renders a shadcn `Tabs` component with "Baumansicht" and "Listenansicht" triggers.
 * The parent controls the active tab via `value` and `onChange`.
 *
 * @param props - Component props.
 * @param props.value - The currently active tab.
 * @param props.onChange - Called with the new tab value when the user switches.
 * @returns The rendered tab toggle bar.
 */
export function SupportServiceViewToggle({ value, onChange }: SupportServiceViewToggleProps) {
  const { t } = useTranslation()

  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v === 'list' ? 'list' : 'tree')}
    >
      <TabsList>
        <TabsTrigger value="tree">{t('features.supportServicesManagement.tabs.tree')}</TabsTrigger>
        <TabsTrigger value="list">{t('features.supportServicesManagement.tabs.list')}</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
