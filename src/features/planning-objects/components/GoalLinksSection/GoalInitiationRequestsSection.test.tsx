import { useState } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { EntityRef } from '../../types/shared.types'
import type { InitiationRequestItem } from './GoalInitiationRequestsSection'
import { GoalInitiationRequestsSection } from './GoalInitiationRequestsSection'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts && typeof opts.name === 'string') return `${key}:${opts.name}`
      return key
    },
  }),
}))

const SINGULAR_KEY = 'features.planningObjects.goals.initiationRequest'

const scopePirs: InitiationRequestItem[] = [
  { id: 'pir-1', name: 'PIR Alpha', status: 'OPEN' },
  { id: 'pir-2', name: 'PIR Beta', status: null },
  { id: 'pir-3', name: 'PIR Gamma', status: 'CLOSED' },
]

function PirsWrapper(initialProps: Parameters<typeof GoalInitiationRequestsSection>[0]) {
  const [pendingPirLinks, setPendingPirLinks] = useState(initialProps.pendingPirLinks)
  const [pendingPirUnlinks, setPendingPirUnlinks] = useState(initialProps.pendingPirUnlinks)
  return (
    <GoalInitiationRequestsSection
      {...initialProps}
      pendingPirLinks={pendingPirLinks}
      setPendingPirLinks={setPendingPirLinks}
      pendingPirUnlinks={pendingPirUnlinks}
      setPendingPirUnlinks={setPendingPirUnlinks}
    />
  )
}

// eslint-disable-next-line max-lines-per-function -- comprehensive test suite
describe('GoalInitiationRequestsSection', () => {
  it('returns null in readOnly mode when no PIRs', () => {
    const { container } = render(
      <GoalInitiationRequestsSection
        persistedPirs={[]}
        scopeInitiationRequests={[]}
        pendingPirLinks={new Set()}
        setPendingPirLinks={vi.fn()}
        pendingPirUnlinks={new Set()}
        setPendingPirUnlinks={vi.fn()}
        readOnly
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows persisted PIRs as secondary badges with singularLabel — name format', () => {
    const persistedPirs: EntityRef[] = [{ id: 'pir-1', name: 'PIR Alpha' }]
    render(
      <GoalInitiationRequestsSection
        persistedPirs={persistedPirs}
        scopeInitiationRequests={scopePirs}
        pendingPirLinks={new Set()}
        setPendingPirLinks={vi.fn()}
        pendingPirUnlinks={new Set()}
        setPendingPirUnlinks={vi.fn()}
        readOnly={false}
      />,
    )
    expect(screen.getByText(`${SINGULAR_KEY} — PIR Alpha`)).toBeInTheDocument()
  })

  it('clicking remove on persisted badge stages unlink — badge disappears', async () => {
    const persistedPirs: EntityRef[] = [{ id: 'pir-1', name: 'PIR Alpha' }]
    render(
      <PirsWrapper
        persistedPirs={persistedPirs}
        scopeInitiationRequests={scopePirs}
        pendingPirLinks={new Set()}
        setPendingPirLinks={vi.fn()}
        pendingPirUnlinks={new Set()}
        setPendingPirUnlinks={vi.fn()}
        readOnly={false}
      />,
    )
    const displayName = `${SINGULAR_KEY} — PIR Alpha`
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes(displayName))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)
    expect(screen.queryByText(displayName)).not.toBeInTheDocument()
  })

  it('staged PIRs shown as outline badges', () => {
    render(
      <GoalInitiationRequestsSection
        persistedPirs={[]}
        scopeInitiationRequests={scopePirs}
        pendingPirLinks={new Set(['pir-1'])}
        setPendingPirLinks={vi.fn()}
        pendingPirUnlinks={new Set()}
        setPendingPirUnlinks={vi.fn()}
        readOnly={false}
      />,
    )
    expect(screen.getByText(`${SINGULAR_KEY} — PIR Alpha`)).toBeInTheDocument()
  })

  it('clicking remove on staged badge removes it', async () => {
    render(
      <PirsWrapper
        persistedPirs={[]}
        scopeInitiationRequests={scopePirs}
        pendingPirLinks={new Set(['pir-1'])}
        setPendingPirLinks={vi.fn()}
        pendingPirUnlinks={new Set()}
        setPendingPirUnlinks={vi.fn()}
        readOnly={false}
      />,
    )
    const displayName = `${SINGULAR_KEY} — PIR Alpha`
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes(displayName))
    await userEvent.click(removeBtn!)
    expect(screen.queryByText(displayName)).not.toBeInTheDocument()
  })

  it('combobox options exclude persisted PIRs even when they are staged for unlink', async () => {
    // All persisted PIRs are in pendingPirUnlinks → hasAnyPir=false → combobox visible
    // But excludedPirIds still contains the persisted ids so they won't appear as options
    const persistedPirs: EntityRef[] = [{ id: 'pir-1', name: 'PIR Alpha' }]
    render(
      <GoalInitiationRequestsSection
        persistedPirs={persistedPirs}
        scopeInitiationRequests={scopePirs}
        pendingPirLinks={new Set()}
        setPendingPirLinks={vi.fn()}
        pendingPirUnlinks={new Set(['pir-1'])}
        setPendingPirUnlinks={vi.fn()}
        readOnly={false}
      />,
    )
    await userEvent.click(screen.getByRole('combobox'))
    const options = await screen.findAllByRole('option')
    const texts = options.map((o) => o.textContent)
    expect(texts.some((t) => t?.includes('PIR Beta'))).toBe(true)
    expect(texts.some((t) => t?.includes('PIR Gamma'))).toBe(true)
    expect(texts.some((t) => t?.includes('PIR Alpha'))).toBe(false)
  })

  it('shows combobox only when no PIRs present and not readOnly', () => {
    render(
      <GoalInitiationRequestsSection
        persistedPirs={[]}
        scopeInitiationRequests={scopePirs}
        pendingPirLinks={new Set()}
        setPendingPirLinks={vi.fn()}
        pendingPirUnlinks={new Set()}
        setPendingPirUnlinks={vi.fn()}
        readOnly={false}
      />,
    )
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('hides combobox when PIRs are present', () => {
    const persistedPirs: EntityRef[] = [{ id: 'pir-1', name: 'PIR Alpha' }]
    render(
      <GoalInitiationRequestsSection
        persistedPirs={persistedPirs}
        scopeInitiationRequests={scopePirs}
        pendingPirLinks={new Set()}
        setPendingPirLinks={vi.fn()}
        pendingPirUnlinks={new Set()}
        setPendingPirUnlinks={vi.fn()}
        readOnly={false}
      />,
    )
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })
})
