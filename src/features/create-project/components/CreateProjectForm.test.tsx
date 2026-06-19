import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { CreateProjectForm } from './CreateProjectForm'

const mockMutate = vi.fn()
const mockIsPending = { value: false }

vi.mock('../hooks/useCreateProject', () => ({
  useCreateProject: () => ({
    mutate: mockMutate,
    isPending: mockIsPending.value,
  }),
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

function renderForm() {
  const Wrapper = makeWrapper()
  return render(createElement(Wrapper, null, createElement(CreateProjectForm)))
}

// Ensure i18n is initialised before tests run
beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('CreateProjectForm', () => {
  it('renders all required fields', async () => {
    renderForm()

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /project name/i })).toBeInTheDocument()
    })
    expect(screen.getByText(/size classification/i)).toBeInTheDocument()
    expect(screen.getByText(/start date/i)).toBeInTheDocument()
    expect(screen.getByText(/end date/i)).toBeInTheDocument()
  })

  it('shows inline error when submitted without a project name', async () => {
    renderForm()
    const user = userEvent.setup()

    await waitFor(() => screen.getByRole('button', { name: /create project/i }))
    await user.click(screen.getByRole('button', { name: /create project/i }))

    await waitFor(() => {
      expect(screen.getByText(/project name is required/i)).toBeInTheDocument()
    })
  })

  it('shows inline error when submitted without size classification', async () => {
    renderForm()
    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox', { name: /project name/i }), 'My Project')
    await user.click(screen.getByRole('button', { name: /create project/i }))

    await waitFor(() => {
      expect(screen.getByText(/size classification is required/i)).toBeInTheDocument()
    })
  })

  it('disables the submit button while mutation is pending', async () => {
    mockIsPending.value = true
    renderForm()

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /create project/i })
      expect(btn).toBeDisabled()
    })

    mockIsPending.value = false
  })

  it('renders the optional description field label and editor', async () => {
    renderForm()

    await waitFor(() => {
      expect(screen.getByText(/project description/i)).toBeInTheDocument()
    })
    expect(screen.getByRole('textbox', { name: /project description/i })).toBeInTheDocument()
  })

  it('does not show a required error for an empty description on submit', async () => {
    renderForm()
    const user = userEvent.setup()

    await waitFor(() => screen.getByRole('button', { name: /create project/i }))
    await user.click(screen.getByRole('button', { name: /create project/i }))

    await waitFor(() => {
      // Name required error should appear, but not description required
      expect(screen.getByText(/project name is required/i)).toBeInTheDocument()
    })
    expect(screen.queryByText(/description.*required/i)).not.toBeInTheDocument()
  })

  it('clears endDate when startDate is changed to a date after the current endDate', async () => {
    renderForm()
    const user = userEvent.setup()

    // Both date inputs share the same placeholder text; get all and pick by index
    const dateInputs = await waitFor(() => screen.getAllByPlaceholderText('MM/DD/YYYY'))
    const startDateInput = dateInputs[0]
    const endDateInput = dateInputs[1]

    // Set endDate to April 1, 2026 and commit by blurring
    await user.click(endDateInput)
    await user.type(endDateInput, '04/01/2026')
    fireEvent.blur(endDateInput)

    // Set startDate to June 1, 2026 (after the endDate) and commit by blurring
    await user.click(startDateInput)
    await user.type(startDateInput, '06/01/2026')
    fireEvent.blur(startDateInput)

    // endDate should have been cleared because it is now before startDate
    await waitFor(() => {
      expect(endDateInput).toHaveValue('')
    })
  })
})
