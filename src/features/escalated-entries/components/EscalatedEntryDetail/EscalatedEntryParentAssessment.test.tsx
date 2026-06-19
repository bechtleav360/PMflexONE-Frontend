import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { EscalatedEntryParentAssessment } from './EscalatedEntryParentAssessment'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('EscalatedEntryParentAssessment', () => {
  it('renders the section title', () => {
    render(
      <EscalatedEntryParentAssessment
        title="Parent Program"
        targetProbability={3}
        targetImpact={4}
      />,
    )

    expect(screen.getByRole('heading', { name: /parent program/i })).toBeInTheDocument()
  })

  it('renders numeric targetProbability and targetImpact values', () => {
    render(
      <EscalatedEntryParentAssessment
        title="Parent"
        targetProbability={3}
        targetImpact={5}
      />,
    )

    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders not-assessed placeholder when targetProbability is null', () => {
    render(
      <EscalatedEntryParentAssessment
        title="Parent"
        targetProbability={null}
        targetImpact={4}
      />,
    )

    // Should show a "not assessed" placeholder text for null probability
    const notAssessedElements = screen.getAllByText(/not assessed/i)
    expect(notAssessedElements.length).toBeGreaterThanOrEqual(1)
  })

  it('renders not-assessed placeholder when targetImpact is null', () => {
    render(
      <EscalatedEntryParentAssessment
        title="Parent"
        targetProbability={2}
        targetImpact={null}
      />,
    )

    const notAssessedElements = screen.getAllByText(/not assessed/i)
    expect(notAssessedElements.length).toBeGreaterThanOrEqual(1)
  })

  it('renders not-assessed placeholders when both values are null', () => {
    render(
      <EscalatedEntryParentAssessment
        title="Parent"
        targetProbability={null}
        targetImpact={null}
      />,
    )

    const notAssessedElements = screen.getAllByText(/not assessed/i)
    expect(notAssessedElements.length).toBe(2)
  })
})
