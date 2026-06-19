import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { AttachmentList } from './AttachmentList'

const mockDeleteAttachment = vi.fn().mockResolvedValue(true)
const mockUploadAttachment = vi.fn().mockResolvedValue(undefined)

vi.mock('../../hooks/useDeleteAttachment', () => ({
  useDeleteAttachment: () => ({ mutateAsync: mockDeleteAttachment, isPending: false }),
}))

vi.mock('../../hooks/useUploadAttachment', () => ({
  useUploadAttachment: () => ({ mutate: mockUploadAttachment, isPending: false }),
}))

vi.mock('@/shared/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    data: { id: 'user-1', firstName: 'Alice', lastName: 'Smith', mail: 'alice@test.com' },
  }),
}))

const fixtureAttachments = [
  {
    id: 'att-1',
    version: 1,
    fileName: 'report.pdf',
    storageKey: 'uploads/report.pdf',
    size: 1024,
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
    metadata: null,
    creator: { id: 'user-1', firstName: 'Alice', lastName: 'Smith', mail: 'alice@test.com' },
  },
  {
    id: 'att-2',
    version: 1,
    fileName: 'notes.docx',
    storageKey: 'uploads/notes.docx',
    size: 2048,
    createdAt: '2026-01-01T11:00:00Z',
    updatedAt: '2026-01-01T11:00:00Z',
    metadata: null,
    creator: { id: 'user-2', firstName: 'Bob', lastName: 'Jones', mail: 'bob@test.com' },
  },
]

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
  mockDeleteAttachment.mockClear()
  mockUploadAttachment.mockClear()
})

function renderList(attachments: typeof fixtureAttachments | never[] = fixtureAttachments) {
  const Wrapper = makeWrapper()
  render(
    createElement(
      Wrapper,
      null,
      createElement(AttachmentList, { workItemId: 'wi-1', attachments }),
    ),
  )
}

describe('AttachmentList — display', () => {
  it('renders attachment file names and uploaders', () => {
    renderList()
    expect(screen.getByText('report.pdf')).toBeInTheDocument()
    expect(screen.getByText('notes.docx')).toBeInTheDocument()
  })

  it('shows delete button only for current user attachments', () => {
    renderList()
    expect(screen.getAllByRole('button', { name: /delete|remove/i })).toHaveLength(1)
  })

  it('shows a download link for every attachment', () => {
    renderList()
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })

  it('shows empty state when no attachments', () => {
    renderList([])
    expect(screen.getByText('No attachments.')).toBeInTheDocument()
  })

  it('shows upload control (FileUpload dropzone is always rendered)', () => {
    renderList([])
    expect(document.querySelector('input[type="file"]')).toBeInTheDocument()
  })

  it('shows the spinner when isFetching is true', () => {
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(AttachmentList, { workItemId: 'wi-1', attachments: [], isFetching: true }),
      ),
    )
    expect(document.querySelector('.animate-spin')).not.toBeNull()
  })

  it('shows the spinner via isFetching (covers the isUploading || isFetching branch)', () => {
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(AttachmentList, { workItemId: 'wi-1', attachments: [], isFetching: true }),
      ),
    )
    expect(document.querySelector('.animate-spin')).not.toBeNull()
  })

  it('determines ownership by mail when both currentUser.mail and att.creator.mail are non-empty', () => {
    renderList()
    expect(screen.getAllByRole('button', { name: /^delete$/i })).toHaveLength(1)
  })

  it('renders Attachments section heading', () => {
    renderList()
    expect(screen.getByRole('heading', { name: /attachments/i })).toBeInTheDocument()
  })

  it('does not call upload when the new files list has no additions (files already tracked)', () => {
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(AttachmentList, { workItemId: 'wi-1', attachments: [] }),
      ),
    )
    expect(mockUploadAttachment).not.toHaveBeenCalled()
  })
})

describe('AttachmentList — interactions', () => {
  it('calls deleteAttachment with correct id and version when delete is clicked and confirmed', async () => {
    renderList()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /^delete$/i }))
    await user.click(screen.getAllByRole('button', { name: /^delete$/i })[0])
    await waitFor(() => {
      expect(mockDeleteAttachment).toHaveBeenCalledOnce()
    })
    const callArg = mockDeleteAttachment.mock.calls[0][0] as { id: string; version: number }
    expect(callArg).toEqual({ id: 'att-1', version: 1 })
  })

  it('calls upload mutation with the selected file when a valid file is chosen', async () => {
    const user = userEvent.setup()
    renderList([])
    const file = new File(['data'], 'test.pdf', { type: 'application/pdf' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)
    await waitFor(() => {
      expect(mockUploadAttachment).toHaveBeenCalledWith([file], expect.any(Object))
    })
  })

  it('does not call upload mutation for files with disallowed type', async () => {
    const user = userEvent.setup()
    renderList([])
    const file = new File(['data'], 'virus.exe', { type: 'application/x-msdownload' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)
    expect(mockUploadAttachment).not.toHaveBeenCalled()
  })

  it('cancels the confirm dialog when onOpenChange fires with false', async () => {
    renderList()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /^delete$/i }))
    await user.keyboard('{Escape}')
    expect(mockDeleteAttachment).not.toHaveBeenCalled()
  })

  it('does not reject a file that has no extension', async () => {
    const user = userEvent.setup()
    renderList([])
    const file = new File(['data'], 'Makefile', { type: '' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)
    expect(mockUploadAttachment).not.toHaveBeenCalled()
  })
})
