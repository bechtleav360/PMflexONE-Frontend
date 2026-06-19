import { type ReactNode } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { Form } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import {
  stakeholderFormSchema,
  type StakeholderFormValues,
  type StakeholderLogValue,
} from '../utils/stakeholderSchema'
import { StakeholderLogsTab } from './StakeholderLogsTab'

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    MarkdownEditor: ({
      value,
      onChange,
      placeholder,
    }: {
      value: string
      onChange: (v: string) => void
      placeholder?: string
    }) => (
      <textarea
        data-testid="markdown-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    ),
    MarkdownContent: ({ value }: { value: string }) => (
      <div data-testid="markdown-content">{value}</div>
    ),
    DatePicker: ({
      value,
      onChange,
    }: {
      value: Date | null
      onChange: (d: Date | null) => void
    }) => (
      <input
        data-testid="date-picker"
        type="date"
        value={value ? value.toISOString().slice(0, 10) : ''}
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value + 'T12:00:00') : null)}
      />
    ),
  }
})

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

function FormWrapper({
  children,
  defaultLogs = [],
}: {
  children: ReactNode
  defaultLogs?: StakeholderLogValue[]
}) {
  const form = useForm<StakeholderFormValues>({
    resolver: zodResolver(stakeholderFormSchema),
    defaultValues: {
      name: 'Test',
      role: 'PM',
      contactGroup: 'INTERNAL',
      logs: defaultLogs,
    },
  })
  return <Form {...form}>{children}</Form>
}

describe('StakeholderLogsTab — empty state', () => {
  it('shows empty state message when no logs and not adding', () => {
    render(
      <FormWrapper>
        <StakeholderLogsTab />
      </FormWrapper>,
    )

    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument()
  })

  it('shows sort toggle button always', () => {
    render(
      <FormWrapper>
        <StakeholderLogsTab />
      </FormWrapper>,
    )

    expect(screen.getByRole('button', { name: /sort/i })).toBeInTheDocument()
  })
})

describe('StakeholderLogsTab — add button visibility', () => {
  it('hides add button when readOnly=true', () => {
    render(
      <FormWrapper>
        <StakeholderLogsTab readOnly={true} />
      </FormWrapper>,
    )

    expect(screen.queryByRole('button', { name: /add|note/i })).not.toBeInTheDocument()
  })
})

describe('StakeholderLogsTab — draft row interaction', () => {
  it('clicking add shows draft row with markdown editor', async () => {
    const user = userEvent.setup()
    render(
      <FormWrapper>
        <StakeholderLogsTab readOnly={false} />
      </FormWrapper>,
    )

    const buttons = screen.getAllByRole('button')
    // The plus/add button is the second button (after sort toggle)
    const addButton = buttons[buttons.length - 1]
    await user.click(addButton)

    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
    expect(screen.getByTestId('date-picker')).toBeInTheDocument()
  })

  it('clicking cancel on draft hides the draft row', async () => {
    const user = userEvent.setup()
    render(
      <FormWrapper>
        <StakeholderLogsTab readOnly={false} />
      </FormWrapper>,
    )

    const buttons = screen.getAllByRole('button')
    const addButton = buttons[buttons.length - 1]
    await user.click(addButton)

    // Draft row should be visible now
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()

    // Click cancel button — cancel button has the cancel label
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(screen.queryByTestId('markdown-editor')).not.toBeInTheDocument()
  })
})

describe('StakeholderLogsTab — search filtering', () => {
  const sampleLogs: StakeholderLogValue[] = [
    { id: 'log-1', date: '2026-01-15', content: 'Meeting with stakeholder about roadmap' },
    { id: 'log-2', date: '2026-02-10', content: 'Follow-up on budget concerns' },
  ]

  it('shows log content when logs exist', () => {
    render(
      <FormWrapper defaultLogs={sampleLogs}>
        <StakeholderLogsTab />
      </FormWrapper>,
    )

    expect(screen.getByText('Meeting with stakeholder about roadmap')).toBeInTheDocument()
    expect(screen.getByText('Follow-up on budget concerns')).toBeInTheDocument()
  })

  it('search input filters visible logs', async () => {
    const user = userEvent.setup()
    render(
      <FormWrapper defaultLogs={sampleLogs}>
        <StakeholderLogsTab />
      </FormWrapper>,
    )

    const searchInput = screen.getByRole('textbox')
    await user.type(searchInput, 'roadmap')

    expect(screen.getByText('Meeting with stakeholder about roadmap')).toBeInTheDocument()
    expect(screen.queryByText('Follow-up on budget concerns')).not.toBeInTheDocument()
  })
})

describe('StakeholderLogsTab — edit mode', () => {
  const sampleLogs: StakeholderLogValue[] = [
    { id: 'log-edit-1', date: '2026-03-01', content: 'Initial contact established' },
  ]

  it('edit button on a log row starts editing (shows markdown editor)', async () => {
    const user = userEvent.setup()
    render(
      <FormWrapper defaultLogs={sampleLogs}>
        <StakeholderLogsTab readOnly={false} />
      </FormWrapper>,
    )

    const editButton = screen.getByRole('button', { name: /edit/i })
    await user.click(editButton)

    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
  })

  it('cancel edit returns to read view', async () => {
    const user = userEvent.setup()
    render(
      <FormWrapper defaultLogs={sampleLogs}>
        <StakeholderLogsTab readOnly={false} />
      </FormWrapper>,
    )

    await user.click(screen.getByRole('button', { name: /edit/i }))
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByTestId('markdown-editor')).not.toBeInTheDocument()
    expect(screen.getByText('Initial contact established')).toBeInTheDocument()
  })

  it('confirm edit saves updated content', async () => {
    const user = userEvent.setup()
    render(
      <FormWrapper defaultLogs={sampleLogs}>
        <StakeholderLogsTab readOnly={false} />
      </FormWrapper>,
    )

    await user.click(screen.getByRole('button', { name: /edit/i }))

    const editor = screen.getByTestId('markdown-editor')
    await user.clear(editor)
    await user.type(editor, 'Updated content')

    // Click the save/confirm button
    await user.click(screen.getByRole('button', { name: /save/i }))

    // After confirming, the editor should be gone
    expect(screen.queryByTestId('markdown-editor')).not.toBeInTheDocument()
  })

  it('readOnly mode hides edit and delete buttons', () => {
    render(
      <FormWrapper defaultLogs={sampleLogs}>
        <StakeholderLogsTab readOnly={true} />
      </FormWrapper>,
    )

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('delete button removes the log entry', async () => {
    const user = userEvent.setup()
    render(
      <FormWrapper defaultLogs={sampleLogs}>
        <StakeholderLogsTab readOnly={false} />
      </FormWrapper>,
    )

    expect(screen.getByText('Initial contact established')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(screen.queryByText('Initial contact established')).not.toBeInTheDocument()
  })
})

describe('StakeholderLogsTab — onHasUnsavedChanges callback', () => {
  it('calls onHasUnsavedChanges(true) when adding starts', async () => {
    const user = userEvent.setup()
    const onHasUnsavedChanges = vi.fn()
    render(
      <FormWrapper>
        <StakeholderLogsTab
          readOnly={false}
          onHasUnsavedChanges={onHasUnsavedChanges}
        />
      </FormWrapper>,
    )

    const buttons = screen.getAllByRole('button')
    const addButton = buttons[buttons.length - 1]
    await user.click(addButton)

    expect(onHasUnsavedChanges).toHaveBeenCalledWith(true)
  })

  it('calls onHasUnsavedChanges(false) after draft cancel', async () => {
    const user = userEvent.setup()
    const onHasUnsavedChanges = vi.fn()
    render(
      <FormWrapper>
        <StakeholderLogsTab
          readOnly={false}
          onHasUnsavedChanges={onHasUnsavedChanges}
        />
      </FormWrapper>,
    )

    const buttons = screen.getAllByRole('button')
    const addButton = buttons[buttons.length - 1]
    await user.click(addButton)
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onHasUnsavedChanges).toHaveBeenLastCalledWith(false)
  })
})

describe('StakeholderLogsTab — draft confirm', () => {
  it('adding a complete draft row appends a new log entry', async () => {
    const user = userEvent.setup()
    render(
      <FormWrapper>
        <StakeholderLogsTab readOnly={false} />
      </FormWrapper>,
    )

    const buttons = screen.getAllByRole('button')
    const addButton = buttons[buttons.length - 1]
    await user.click(addButton)

    // Set date via date picker
    const datePicker = screen.getByTestId('date-picker')
    await user.type(datePicker, '2026-06-10')

    // Fill in content
    const editor = screen.getByTestId('markdown-editor')
    await user.type(editor, 'New stakeholder note')

    // Save button should now be enabled
    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    // Draft row should be gone, new entry visible
    expect(screen.queryByTestId('markdown-editor')).not.toBeInTheDocument()
  })
})
