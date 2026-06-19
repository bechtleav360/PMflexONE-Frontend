import type { ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components'

import type { EscalatedEntry } from '../../types/escalatedEntry.types'
import { EscalationLogTab } from '../EscalationLogTab'
import { EscalatedEntryAssessmentSection } from './EscalatedEntryAssessmentSection'
import { EscalatedEntryMeasuresList } from './EscalatedEntryMeasuresList'
import { EscalatedEntryParentAssessment } from './EscalatedEntryParentAssessment'

interface TabConfig {
  value: string
  label: string
  content: ReactNode
}

type HistoryEntry = NonNullable<EscalatedEntry['parentEntry']>

function buildCombinedProtocol(entry: EscalatedEntry) {
  return [
    ...entry.escalationProtocol,
    ...(entry.parentEntry?.escalationProtocol ?? []),
    ...(entry.childEntry?.escalationProtocol ?? []),
  ]
}

function toTab(show: boolean, config: TabConfig): TabConfig[] {
  return show ? [config] : []
}

function parentHistoryTabs(
  entry: HistoryEntry,
  historyLabel: string,
  measuresLabel: string,
  assessmentTitle: string,
): TabConfig[] {
  return [
    {
      value: 'assessmentHistory',
      label: historyLabel,
      content: (
        <EscalatedEntryParentAssessment
          title={assessmentTitle}
          targetProbability={entry.targetProbability}
          targetImpact={entry.targetImpact}
        />
      ),
    },
    {
      value: 'measuresHistory',
      label: measuresLabel,
      content: (
        <EscalatedEntryMeasuresList
          escalatedEntryId={entry.id}
          measures={entry.measures}
          isLocked
        />
      ),
    },
  ]
}

function childHistoryTabs(
  entry: HistoryEntry,
  historyLabel: string,
  measuresLabel: string,
  assessmentTitle: string,
): TabConfig[] {
  return [
    {
      value: 'childAssessmentHistory',
      label: historyLabel,
      content: (
        <EscalatedEntryParentAssessment
          title={assessmentTitle}
          targetProbability={entry.targetProbability}
          targetImpact={entry.targetImpact}
        />
      ),
    },
    {
      value: 'childMeasuresHistory',
      label: measuresLabel,
      content: (
        <EscalatedEntryMeasuresList
          escalatedEntryId={entry.id}
          measures={entry.measures}
          isLocked
        />
      ),
    },
  ]
}

interface EscalatedEntryTabsProps {
  escalatedEntry: EscalatedEntry
  isLocked: boolean
  showMeasures: boolean
  closeDetail: () => void
}

/**
 * Tabbed layout for an escalated entry detail view.
 * Renders a standalone assessment section when no supplementary tabs are applicable.
 *
 * @param root0 - Component props.
 * @param root0.escalatedEntry - The entry to display.
 * @param root0.isLocked - Whether edit actions are disabled.
 * @param root0.showMeasures - Whether to include the measures tab.
 * @param root0.closeDetail - Callback invoked when the assessment is saved.
 * @returns Tabs layout or a standalone assessment section.
 */
export function EscalatedEntryTabs({
  escalatedEntry,
  isLocked,
  showMeasures,
  closeDetail,
}: EscalatedEntryTabsProps) {
  const { t } = useTranslation()
  const { parentEntry, childEntry } = escalatedEntry
  const combinedProtocol = buildCombinedProtocol(escalatedEntry)

  const tabs: TabConfig[] = [
    {
      value: 'assessment',
      label: t('features.escalatedEntries.detail.tabs.assessment'),
      content: (
        <EscalatedEntryAssessmentSection
          entry={escalatedEntry}
          onSuccess={closeDetail}
          isLocked={isLocked}
        />
      ),
    },
    ...toTab(combinedProtocol.length > 0, {
      value: 'log',
      label: t('features.escalatedEntries.log.title'),
      content: <EscalationLogTab events={combinedProtocol} />,
    }),
    ...toTab(showMeasures, {
      value: 'measures',
      label: t('features.escalatedEntries.detail.tabs.measures'),
      content: (
        <EscalatedEntryMeasuresList
          escalatedEntryId={escalatedEntry.id}
          measures={escalatedEntry.measures}
          isLocked={isLocked}
        />
      ),
    }),
    ...(parentEntry
      ? parentHistoryTabs(
          parentEntry,
          t('features.escalatedEntries.detail.tabs.assessmentHistory'),
          t('features.escalatedEntries.detail.tabs.measuresHistory'),
          t('features.escalatedEntries.detail.parentAssessment.title'),
        )
      : []),
    ...(childEntry
      ? childHistoryTabs(
          childEntry,
          t('features.escalatedEntries.detail.tabs.assessmentHistory'),
          t('features.escalatedEntries.detail.tabs.measuresHistory'),
          t('features.escalatedEntries.detail.childAssessment.title'),
        )
      : []),
  ]

  if (tabs.length === 1) {
    return (
      <EscalatedEntryAssessmentSection
        entry={escalatedEntry}
        isLocked={isLocked}
      />
    )
  }

  return (
    <Tabs defaultValue="assessment">
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
