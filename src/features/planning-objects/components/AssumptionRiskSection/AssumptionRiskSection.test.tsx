import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { AssumptionRiskSection } from './AssumptionRiskSection'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...(actual as object), useNavigate: () => mockNavigate }
})

function renderSection(props: Parameters<typeof AssumptionRiskSection>[0]) {
  return render(createElement(MemoryRouter, null, createElement(AssumptionRiskSection, props)))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

// eslint-disable-next-line max-lines-per-function -- comprehensive test suite for complex UI component
describe('AssumptionRiskSection', () => {
  it('renders checkbox with label', () => {
    renderSection({
      isRisk: false,
      linkedRisk: null,
      hasRiskWriteAccess: true,
      onIsRiskChange: vi.fn(),
    })
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.getByText('Is a risk')).toBeInTheDocument()
  })

  it('checkbox is disabled and tooltip shown when no write access', async () => {
    renderSection({
      isRisk: false,
      linkedRisk: null,
      hasRiskWriteAccess: false,
      onIsRiskChange: vi.fn(),
    })
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()

    await userEvent.hover(checkbox.closest('span')!)
    const tooltipElements = await screen.findAllByText('Write access to risk register required')
    expect(tooltipElements.length).toBeGreaterThan(0)
  })

  it('checkbox has aria-describedby when no write access', () => {
    renderSection({
      isRisk: false,
      linkedRisk: null,
      hasRiskWriteAccess: false,
      onIsRiskChange: vi.fn(),
    })
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('aria-describedby')
  })

  it('shows linked risk badge when linkedRisk is set', () => {
    renderSection({
      isRisk: true,
      linkedRisk: { id: 'risk-1', name: 'Critical Risk', status: 'open' },
      hasRiskWriteAccess: true,
      onIsRiskChange: vi.fn(),
      scopeId: 'proj-1',
    })
    expect(screen.getByText(/Critical Risk/)).toBeInTheDocument()
  })

  it('does not show badge when linkedRisk is null', () => {
    renderSection({
      isRisk: false,
      linkedRisk: null,
      hasRiskWriteAccess: true,
      onIsRiskChange: vi.fn(),
    })
    expect(screen.queryByRole('button', { name: /Risk entry/ })).not.toBeInTheDocument()
  })

  it('calls onIsRiskChange when checkbox toggled with write access', async () => {
    const onIsRiskChange = vi.fn()
    renderSection({
      isRisk: false,
      linkedRisk: null,
      hasRiskWriteAccess: true,
      onIsRiskChange,
    })
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onIsRiskChange).toHaveBeenCalledWith(true)
  })

  it('blocks uncheck when linked risk is active', async () => {
    const onIsRiskChange = vi.fn()
    renderSection({
      isRisk: true,
      linkedRisk: { id: 'risk-1', name: 'Active Risk', status: 'open' },
      hasRiskWriteAccess: true,
      onIsRiskChange,
    })
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onIsRiskChange).not.toHaveBeenCalled()
  })

  it('allows uncheck when linked risk is closed', async () => {
    const onIsRiskChange = vi.fn()
    renderSection({
      isRisk: true,
      linkedRisk: { id: 'risk-1', name: 'Closed Risk', status: 'closed' },
      hasRiskWriteAccess: true,
      onIsRiskChange,
    })
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onIsRiskChange).toHaveBeenCalledWith(false)
  })

  it('allows uncheck when linked risk is rejected', async () => {
    const onIsRiskChange = vi.fn()
    renderSection({
      isRisk: true,
      linkedRisk: { id: 'risk-1', name: 'Rejected Risk', status: 'rejected' },
      hasRiskWriteAccess: true,
      onIsRiskChange,
    })
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onIsRiskChange).toHaveBeenCalledWith(false)
  })

  it('allows uncheck when no linked risk exists', async () => {
    const onIsRiskChange = vi.fn()
    renderSection({
      isRisk: true,
      linkedRisk: null,
      hasRiskWriteAccess: true,
      onIsRiskChange,
    })
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onIsRiskChange).toHaveBeenCalledWith(false)
  })

  it('does not render navigate button when linkedRisk is set but scopeId is absent', () => {
    renderSection({
      isRisk: true,
      linkedRisk: { id: 'risk-1', name: 'Active Risk', status: 'open' },
      hasRiskWriteAccess: true,
      onIsRiskChange: vi.fn(),
    })
    expect(screen.queryByRole('button', { name: /Risk entry/i })).not.toBeInTheDocument()
  })

  it('navigate button navigates to risk management on click', async () => {
    renderSection({
      isRisk: true,
      linkedRisk: { id: 'risk-1', name: 'Active Risk', status: 'open' },
      hasRiskWriteAccess: true,
      onIsRiskChange: vi.fn(),
      scopeId: 'proj-1',
    })
    await userEvent.click(screen.getByRole('button', { name: /Risk entry/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/projects/proj-1/risk-management')
  })
})
