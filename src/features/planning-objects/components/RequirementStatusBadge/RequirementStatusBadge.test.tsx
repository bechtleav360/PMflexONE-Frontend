import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { RequirementStatusBadge } from './RequirementStatusBadge'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}))

describe('RequirementStatusBadge', () => {
  it.each([
    ['NEW', 'features.planningObjects.requirements.status.new'],
    ['ANALYSED', 'features.planningObjects.requirements.status.analysed'],
    ['SPECIFIED', 'features.planningObjects.requirements.status.specified'],
    ['IMPLEMENTED', 'features.planningObjects.requirements.status.implemented'],
    ['TESTED', 'features.planningObjects.requirements.status.tested'],
    ['ACCEPTED', 'features.planningObjects.requirements.status.accepted'],
  ] as const)('renders label for %s status', (status, expectedLabel) => {
    render(<RequirementStatusBadge status={status} />)
    expect(screen.getByText(expectedLabel)).toBeInTheDocument()
  })

  it('NEW badge has muted colour classes', () => {
    const { container } = render(<RequirementStatusBadge status="NEW" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/muted/)
  })

  it('ACCEPTED badge has green colour classes', () => {
    const { container } = render(<RequirementStatusBadge status="ACCEPTED" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/bg-success|text-success|success/)
  })

  it('IMPLEMENTED badge has warning colour classes', () => {
    const { container } = render(<RequirementStatusBadge status="IMPLEMENTED" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/warning/)
  })
})
