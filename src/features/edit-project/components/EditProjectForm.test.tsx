import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useEditProjectStore } from '../store/editProjectStore'
import { EditProjectForm } from './EditProjectForm'

vi.mock('../hooks/useEditProject', () => ({
  useEditProject: () => ({ mutateAsync: vi.fn(), isPending: false }),
  updateWithToast: vi.fn(),
}))

const mockProject = {
  id: 'e2e00000-0000-0000-0000-000000000001',
  name: 'Basisinfrastruktur',
  description: null,
  status: 'active',
  sizeClassification: 'large' as const,
  governanceStatus: null,
  startDate: '2025-01-01',
  endDate: '2027-12-31',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  version: 1,
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

function renderForm(onCancel?: () => void) {
  const Wrapper = makeWrapper()
  return render(createElement(Wrapper, null, <EditProjectForm onCancel={onCancel} />))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useEditProjectStore.setState({ open: true, payload: mockProject })
})

describe('EditProjectForm', () => {
  it('renders all form fields', async () => {
    renderForm()

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /project name/i })).toBeInTheDocument()
    })
    expect(screen.getByText(/size classification/i)).toBeInTheDocument()
    expect(screen.getByText(/start date/i)).toBeInTheDocument()
    expect(screen.getByText(/end date/i)).toBeInTheDocument()
  })

  it('pre-populates the name field with the current project name', async () => {
    renderForm()

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /project name/i })).toHaveValue(mockProject.name)
    })
  })

  it('calls onCancel when the cancel button is clicked', async () => {
    const onCancel = vi.fn()
    renderForm(onCancel)
    const user = userEvent.setup()

    await waitFor(() => screen.getByRole('button', { name: /cancel/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('renders the save changes submit button', async () => {
    renderForm()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    })
  })
})
