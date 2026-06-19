import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { RequirementScopeBadge } from './RequirementScopeBadge'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}))

describe('RequirementScopeBadge', () => {
  it('renders IN_SCOPE label', () => {
    render(<RequirementScopeBadge scope="IN_SCOPE" />)
    expect(
      screen.getByText('features.planningObjects.requirements.scope.inScope'),
    ).toBeInTheDocument()
  })

  it('renders OUT_OF_SCOPE label', () => {
    render(<RequirementScopeBadge scope="OUT_OF_SCOPE" />)
    expect(
      screen.getByText('features.planningObjects.requirements.scope.outOfScope'),
    ).toBeInTheDocument()
  })

  it('IN_SCOPE badge has green success colour classes', () => {
    const { container } = render(<RequirementScopeBadge scope="IN_SCOPE" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/bg-success|text-success|success/)
  })

  it('OUT_OF_SCOPE badge has muted colour classes', () => {
    const { container } = render(<RequirementScopeBadge scope="OUT_OF_SCOPE" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/muted/)
  })
})
