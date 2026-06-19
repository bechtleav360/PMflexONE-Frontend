import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { PortfolioProgramsSection } from './PortfolioProgramsSection'

vi.mock('./ProgramList', () => ({
  ProgramList: () => <div data-testid="program-list" />,
}))

const mockOpenCreateProgram = vi.hoisted(() => vi.fn())

vi.mock('../store/useCreateProgramDialogStore', () => ({
  useCreateProgramDialogStore: (selector: (s: { open: typeof mockOpenCreateProgram }) => unknown) =>
    selector({ open: mockOpenCreateProgram }),
}))

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const defaultProps = {
  portfolioId: 'port-1',
  rows: [],
  isPending: false,
  isError: false,
  sort: null,
  onSortChange: vi.fn(),
  onEdit: vi.fn(),
}

function renderSection(overrides: Partial<typeof defaultProps> = {}) {
  return render(
    <PortfolioProgramsSection
      {...defaultProps}
      {...overrides}
    />,
  )
}

describe('PortfolioProgramsSection', () => {
  beforeEach(() => {
    mockOpenCreateProgram.mockReset()
  })

  it('renders the section heading', () => {
    renderSection()
    expect(screen.getByText('Associated Programs')).toBeInTheDocument()
  })

  it('renders the create new program button', () => {
    renderSection()
    expect(screen.getByRole('button', { name: /create new program/i })).toBeInTheDocument()
  })

  it('opens the create program dialog with the portfolioId when the button is clicked', async () => {
    renderSection({ portfolioId: 'port-42' })
    await userEvent.click(screen.getByRole('button', { name: /create new program/i }))
    expect(mockOpenCreateProgram).toHaveBeenCalledWith('port-42')
  })

  it('renders the ProgramList', () => {
    renderSection()
    expect(screen.getByTestId('program-list')).toBeInTheDocument()
  })
})
