import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type * as sharedUtils from '@/shared/lib/utils'

import type { EscalationEvent } from '../../types/escalatedEntry.types'
import { EscalationLogTab } from './EscalationLogTab'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}))

vi.mock('@/shared/lib/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof sharedUtils>()
  return { ...actual, formatDate: (iso: string) => iso.slice(0, 10) }
})

const makeEvent = (overrides: Partial<EscalationEvent> = {}): EscalationEvent => ({
  id: 'ev-1',
  version: 1,
  eventType: 'ESCALATION',
  reason: 'Needs attention',
  occurredAt: '2024-01-15T10:00:00Z',
  performedBy: { id: 'u-1', firstName: 'Alice', lastName: 'Smith', mail: 'alice@example.com' },
  ...overrides,
})

describe('EscalationLogTab', () => {
  it('renders empty state when no events', () => {
    render(createElement(EscalationLogTab, { events: [] }))
    expect(screen.getByText('features.escalatedEntries.log.empty')).toBeDefined()
  })

  it('renders all events in chronological order (oldest first)', () => {
    const events = [
      makeEvent({ id: 'ev-2', occurredAt: '2024-02-01T00:00:00Z', eventType: 'DE_ESCALATION' }),
      makeEvent({ id: 'ev-1', occurredAt: '2024-01-15T10:00:00Z', eventType: 'ESCALATION' }),
    ]
    render(createElement(EscalationLogTab, { events }))

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0].textContent).toContain('ESCALATION')
    expect(items[1].textContent).toContain('DE_ESCALATION')
  })

  it('shows translated event type for each event', () => {
    render(createElement(EscalationLogTab, { events: [makeEvent()] }))
    expect(screen.getByText('features.escalatedEntries.log.eventType.ESCALATION')).toBeDefined()
  })

  it('shows performer name for each event', () => {
    render(createElement(EscalationLogTab, { events: [makeEvent()] }))
    expect(screen.getByText('Alice Smith')).toBeDefined()
  })

  it('shows formatted date for each event', () => {
    render(createElement(EscalationLogTab, { events: [makeEvent()] }))
    expect(screen.getByText('2024-01-15')).toBeDefined()
  })

  it('shows reason text for each event', () => {
    render(createElement(EscalationLogTab, { events: [makeEvent()] }))
    expect(screen.getByText('Needs attention')).toBeDefined()
  })

  it('renders DE_ESCALATION event type', () => {
    render(
      createElement(EscalationLogTab, {
        events: [makeEvent({ eventType: 'DE_ESCALATION', reason: 'Resolved' })],
      }),
    )
    expect(screen.getByText('features.escalatedEntries.log.eventType.DE_ESCALATION')).toBeDefined()
    expect(screen.getByText('Resolved')).toBeDefined()
  })
})
