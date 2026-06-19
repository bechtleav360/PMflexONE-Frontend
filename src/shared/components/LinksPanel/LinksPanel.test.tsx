import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { LinksPanel } from './LinksPanel'
import type { LinksPanelSection } from './LinksPanel'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const item = { id: 'i-1', entryNumber: 'R-001', name: 'Budget Risk', status: 'Open' }

describe('LinksPanel — rendering', () => {
  it('renders nothing when sections array is empty', () => {
    const { container } = render(<LinksPanel sections={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders section title', () => {
    const sections: LinksPanelSection[] = [{ title: 'Linked Issues', items: [item] }]
    render(<LinksPanel sections={sections} />)
    expect(screen.getByText('Linked Issues')).toBeInTheDocument()
  })

  it('renders item entry number, name, and status', () => {
    const sections: LinksPanelSection[] = [{ title: 'Linked Issues', items: [item] }]
    render(<LinksPanel sections={sections} />)
    expect(screen.getByText('R-001')).toBeInTheDocument()
    expect(screen.getByText('Budget Risk')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('renders empty-state message when section has no items', () => {
    const sections: LinksPanelSection[] = [{ title: 'Linked Risks', items: [] }]
    render(<LinksPanel sections={sections} />)
    expect(screen.getByText('Linked Risks')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('does not render Remove button when onRemove is absent', () => {
    const sections: LinksPanelSection[] = [{ title: 'Linked Issues', items: [item] }]
    render(<LinksPanel sections={sections} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders Remove button when onRemove is provided', () => {
    const sections: LinksPanelSection[] = [
      { title: 'Linked Issues', items: [item], onRemove: vi.fn() },
    ]
    render(<LinksPanel sections={sections} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('uses section.title as the key — renders multiple sections', () => {
    const sections: LinksPanelSection[] = [
      { title: 'Linked Risks', items: [item] },
      { title: 'Linked Problems', items: [] },
    ]
    render(<LinksPanel sections={sections} />)
    expect(screen.getByText('Linked Risks')).toBeInTheDocument()
    expect(screen.getByText('Linked Problems')).toBeInTheDocument()
  })
})

describe('LinksPanel — interactions', () => {
  it('calls onRemove with item id when Remove is clicked', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    const sections: LinksPanelSection[] = [{ title: 'Linked Issues', items: [item], onRemove }]
    render(<LinksPanel sections={sections} />)
    await user.click(screen.getByRole('button'))
    expect(onRemove).toHaveBeenCalledWith('i-1')
  })

  it('disables Remove button when isRemoving is true', () => {
    const sections: LinksPanelSection[] = [
      { title: 'Linked Issues', items: [item], onRemove: vi.fn(), isRemoving: true },
    ]
    render(<LinksPanel sections={sections} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
