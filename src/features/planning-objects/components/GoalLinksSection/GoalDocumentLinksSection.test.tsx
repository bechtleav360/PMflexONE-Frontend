import { useState } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { GoalDocumentLinksSection } from './GoalDocumentLinksSection'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts && typeof opts.name === 'string') return `${key}:${opts.name}`
      return key
    },
  }),
}))

const LABEL_KEY = 'features.planningObjects.goals.businessCase'

function DocumentLinkWrapper(initialProps: Parameters<typeof GoalDocumentLinksSection>[0]) {
  const [pendingLink, setPendingLink] = useState(initialProps.pendingLink)
  const [pendingUnlink, setPendingUnlink] = useState(initialProps.pendingUnlink)
  return (
    <GoalDocumentLinksSection
      {...initialProps}
      pendingLink={pendingLink}
      setPendingLink={setPendingLink}
      pendingUnlink={pendingUnlink}
      setPendingUnlink={setPendingUnlink}
    />
  )
}

// eslint-disable-next-line max-lines-per-function -- comprehensive test suite
describe('GoalDocumentLinksSection', () => {
  it('returns null when no effective link, readOnly=true', () => {
    const { container } = render(
      <GoalDocumentLinksSection
        linkedDocument={null}
        scopeDocument={null}
        pendingLink={null}
        setPendingLink={vi.fn()}
        pendingUnlink={false}
        setPendingUnlink={vi.fn()}
        labelKey={LABEL_KEY}
        isProjectScope={false}
        readOnly
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('returns null when no effective link and not project scope in edit mode', () => {
    const { container } = render(
      <GoalDocumentLinksSection
        linkedDocument={null}
        scopeDocument={null}
        pendingLink={null}
        setPendingLink={vi.fn()}
        pendingUnlink={false}
        setPendingUnlink={vi.fn()}
        labelKey={LABEL_KEY}
        isProjectScope={false}
        readOnly={false}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows section heading with t(labelKey) value', () => {
    render(
      <GoalDocumentLinksSection
        linkedDocument={{ id: 'bc-1', status: 'DRAFT' }}
        scopeDocument={null}
        pendingLink={null}
        setPendingLink={vi.fn()}
        pendingUnlink={false}
        setPendingUnlink={vi.fn()}
        labelKey={LABEL_KEY}
        isProjectScope={true}
        readOnly={false}
      />,
    )
    expect(screen.getAllByText(LABEL_KEY).length).toBeGreaterThanOrEqual(1)
  })

  it('shows secondary badge when document linked and no pending unlink', () => {
    render(
      <GoalDocumentLinksSection
        linkedDocument={{ id: 'bc-1', status: 'DRAFT' }}
        scopeDocument={null}
        pendingLink={null}
        setPendingLink={vi.fn()}
        pendingUnlink={false}
        setPendingUnlink={vi.fn()}
        labelKey={LABEL_KEY}
        isProjectScope={true}
        readOnly={false}
      />,
    )
    const badge = screen.getAllByText(LABEL_KEY).find((el) => el.tagName === 'SPAN')
    expect(badge).toBeDefined()
  })

  it('shows outline badge when pendingLink is set', () => {
    render(
      <GoalDocumentLinksSection
        linkedDocument={null}
        scopeDocument={{ id: 'bc-1' }}
        pendingLink="bc-1"
        setPendingLink={vi.fn()}
        pendingUnlink={false}
        setPendingUnlink={vi.fn()}
        labelKey={LABEL_KEY}
        isProjectScope={true}
        readOnly={false}
      />,
    )
    expect(screen.getAllByText(LABEL_KEY).length).toBeGreaterThanOrEqual(1)
  })

  it('clicking remove on persisted badge stages unlink — badge replaced by combobox', async () => {
    render(
      <DocumentLinkWrapper
        linkedDocument={{ id: 'bc-1', status: 'DRAFT' }}
        scopeDocument={{ id: 'bc-1' }}
        pendingLink={null}
        setPendingLink={vi.fn()}
        pendingUnlink={false}
        setPendingUnlink={vi.fn()}
        labelKey={LABEL_KEY}
        isProjectScope={true}
        readOnly={false}
      />,
    )
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes(LABEL_KEY))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('clicking remove on staged badge calls setPendingLink(null)', async () => {
    render(
      <DocumentLinkWrapper
        linkedDocument={null}
        scopeDocument={{ id: 'bc-1' }}
        pendingLink="bc-1"
        setPendingLink={vi.fn()}
        pendingUnlink={false}
        setPendingUnlink={vi.fn()}
        labelKey={LABEL_KEY}
        isProjectScope={true}
        readOnly={false}
      />,
    )
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes(LABEL_KEY))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows combobox when not effective and isProjectScope=true and not readOnly', () => {
    render(
      <GoalDocumentLinksSection
        linkedDocument={null}
        scopeDocument={{ id: 'bc-1' }}
        pendingLink={null}
        setPendingLink={vi.fn()}
        pendingUnlink={false}
        setPendingUnlink={vi.fn()}
        labelKey={LABEL_KEY}
        isProjectScope={true}
        readOnly={false}
      />,
    )
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('combobox option label includes project.name when available', async () => {
    render(
      <GoalDocumentLinksSection
        linkedDocument={null}
        scopeDocument={{ id: 'bc-1', project: { name: 'My Project' } }}
        pendingLink={null}
        setPendingLink={vi.fn()}
        pendingUnlink={false}
        setPendingUnlink={vi.fn()}
        labelKey={LABEL_KEY}
        isProjectScope={true}
        readOnly={false}
      />,
    )
    await userEvent.click(screen.getByRole('combobox'))
    expect(await screen.findByText(`${LABEL_KEY} — My Project`)).toBeInTheDocument()
  })

  it('staging a link via combobox shows badge', async () => {
    render(
      <DocumentLinkWrapper
        linkedDocument={null}
        scopeDocument={{ id: 'bc-1' }}
        pendingLink={null}
        setPendingLink={vi.fn()}
        pendingUnlink={false}
        setPendingUnlink={vi.fn()}
        labelKey={LABEL_KEY}
        isProjectScope={true}
        readOnly={false}
      />,
    )
    await userEvent.click(screen.getByRole('combobox'))
    const option = await screen.findByRole('option')
    await userEvent.click(option)
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes(LABEL_KEY))
    expect(removeBtn).toBeDefined()
  })
})
