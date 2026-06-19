import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import type { RiskEntry } from '../../types/riskEntry.types'
import { EditRiskEntryForm } from './EditRiskEntryForm'

vi.mock('../../hooks/useRiskEntryStatuses', () => ({
  useRiskEntryStatuses: () => ({
    data: [
      { status: 'PROPOSED', description: 'Proposed', displayOrder: 1 },
      { status: 'ASSESSED', description: 'Assessed', displayOrder: 2 },
    ],
    isLoading: false,
  }),
}))

const mockOnSubmit = vi.fn()

const sampleEntry: RiskEntry = {
  id: 'r-1',
  version: 1,
  entryNumber: 'R-001',
  type: 'RISK',
  name: 'Budget overrun',
  pestelCategory: 'ECONOMIC',
  description: null,
  status: 'proposed',
  identificationDate: '2024-01-15',
  probability: 3,
  impact: 4,
  riskLevel: 12,
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  owner: null,
  reporter: null,
  activeEscalations: [],
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

function renderForm(entry = sampleEntry) {
  const Wrapper = makeWrapper()
  return render(
    createElement(
      Wrapper,
      null,
      createElement(
        'div',
        null,
        createElement(EditRiskEntryForm, { entry, onSubmit: mockOnSubmit, isPending: false }),
        createElement('button', { type: 'submit', form: 'edit-risk-entry-form' }, 'Save Changes'),
      ),
    ),
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  mockOnSubmit.mockReset()
})

describe('EditRiskEntryForm', () => {
  it('pre-populates name field with entry value', () => {
    renderForm()
    expect(screen.getByDisplayValue('Budget overrun')).toBeInTheDocument()
  })

  it('renders all expected fields including type, probability and impact', () => {
    renderForm()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/pestel category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/probability/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/impact/i)).toBeInTheDocument()
  })

  it('shows validation error when name is cleared and submitted', async () => {
    renderForm()
    await userEvent.clear(screen.getByLabelText(/name/i))
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
  })

  it('calls onSubmit with entry id and updated values on valid submit', async () => {
    mockOnSubmit.mockResolvedValue(undefined)
    renderForm()

    await userEvent.clear(screen.getByLabelText(/name/i))
    await userEvent.type(screen.getByLabelText(/name/i), 'Updated risk')
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
      expect(mockOnSubmit.mock.calls[0][0]).toMatchObject({ name: 'Updated risk' })
    })
  })

  it('calls onSubmit when form is submitted', async () => {
    mockOnSubmit.mockResolvedValue(undefined)
    renderForm()

    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledOnce())
  })
})
