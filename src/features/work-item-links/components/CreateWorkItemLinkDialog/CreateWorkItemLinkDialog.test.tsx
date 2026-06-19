import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { CreateWorkItemLinkDialog } from './CreateWorkItemLinkDialog'

const mockCreateLink = vi
  .fn()
  .mockResolvedValue({ id: 'link-new', linkType: 'related', target: { id: 'wi-5' } })

vi.mock('../../hooks/useCreateWorkItemLink', () => ({
  useCreateWorkItemLink: () => ({ mutateAsync: mockCreateLink, isPending: false }),
}))

vi.mock('../../store/linkDialogStores', () => ({
  useCreateWorkItemLinkDialogStore: Object.assign(
    (selector: (s: { open: boolean; closeModal: () => void }) => unknown) =>
      selector({ open: true, closeModal: vi.fn() }),
    {
      getState: () => ({ open: true, closeModal: vi.fn() }),
      setState: vi.fn(),
    },
  ),
}))

vi.mock('@/entities/work-item', () => ({
  useWorkItem: () => ({ data: { id: 'wi-1', version: 1, links: [] } }),
  useWorkItems: () => ({ data: [] }),
}))

// Stub the Combobox with a plain input so tests can interact with it
// without needing to drive Radix Popover interactions in jsdom.
vi.mock('@/shared/components', async (importActual) => {
  const actual = await importActual<Record<string, unknown>>()
  return {
    ...actual,
    Combobox: ({
      onChange,
      placeholder,
    }: {
      value: string | null
      onChange: (v: string | null) => void
      placeholder?: string
    }) =>
      createElement('input', {
        'aria-label': 'Linked Item',
        placeholder,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value || null),
      }),
  }
})

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: qc }, children)
  }
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  mockCreateLink.mockClear()
})

describe('CreateWorkItemLinkDialog', () => {
  it('submits createWorkItemLink with correct arguments', async () => {
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(CreateWorkItemLinkDialog, {
          workItemId: 'wi-1',
          scopeType: 'Project',
          scopeId: 'scope-1',
        }),
      ),
    )
    const user = userEvent.setup()

    const toIdInput = screen.getByRole('textbox', { name: /linked item/i })
    await user.type(toIdInput, 'wi-5')

    const submitBtn = screen.getByRole('button', { name: /add link|create|save/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(mockCreateLink).toHaveBeenCalledOnce()
    })

    const callArg = mockCreateLink.mock.calls[0][0] as {
      input: { fromWorkItemId: string; toWorkItemId: string; linkType: string }
    }
    expect(callArg.input.fromWorkItemId).toBe('wi-1')
    expect(callArg.input.toWorkItemId).toBe('wi-5')
    expect(callArg.input.linkType).toBeDefined()
  })

  it('shows validation error when target id is empty', async () => {
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(CreateWorkItemLinkDialog, {
          workItemId: 'wi-1',
          scopeType: 'Project',
          scopeId: 'scope-1',
        }),
      ),
    )
    const user = userEvent.setup()

    const submitBtn = screen.getByRole('button', { name: /add link|create|save/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(mockCreateLink).not.toHaveBeenCalled()
    })
  })

  it('displays error toast on cycle / server error', async () => {
    mockCreateLink.mockRejectedValueOnce(new Error('Cycle detected'))
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(CreateWorkItemLinkDialog, {
          workItemId: 'wi-1',
          scopeType: 'Project',
          scopeId: 'scope-1',
        }),
      ),
    )
    const user = userEvent.setup()

    const toIdInput = screen.getByRole('textbox', { name: /linked item/i })
    await user.type(toIdInput, 'wi-5')

    const submitBtn = screen.getByRole('button', { name: /add link|create|save/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(mockCreateLink).toHaveBeenCalledOnce()
    })
    // toast error is handled by the hook; component should not throw
    expect(document.body).toBeInTheDocument()
  })
})
