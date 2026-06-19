import { type ReactNode } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { beforeAll, describe, expect, it } from 'vitest'

import { Form } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { stakeholderFormSchema, type StakeholderFormValues } from '../utils/stakeholderSchema'
import { StakeholderContactTab } from './StakeholderContactTab'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

function FormWrapper({
  children,
  defaultValues,
}: {
  children: ReactNode
  defaultValues?: Partial<StakeholderFormValues>
}) {
  const form = useForm<StakeholderFormValues>({
    resolver: zodResolver(stakeholderFormSchema),
    defaultValues: {
      name: 'Test',
      role: 'PM',
      contactGroup: 'INTERNAL',
      email: null,
      email2: null,
      email3: null,
      phone: null,
      phone2: null,
      phone3: null,
      ...defaultValues,
    },
  })
  return <Form {...form}>{children}</Form>
}

describe('StakeholderContactTab — basic fields', () => {
  it('renders preferredCommunicationType, email and phone fields', () => {
    render(
      <FormWrapper>
        <StakeholderContactTab readOnly={false} />
      </FormWrapper>,
    )

    expect(screen.getByRole('textbox', { name: /preferred communication/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /^email$/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /^phone$/i })).toBeInTheDocument()
  })
})

describe('StakeholderContactTab — conditional email fields', () => {
  it('hides email2 when email is empty', () => {
    render(
      <FormWrapper>
        <StakeholderContactTab readOnly={false} />
      </FormWrapper>,
    )

    expect(screen.queryByRole('textbox', { name: /email.*2nd/i })).not.toBeInTheDocument()
  })

  it('shows email2 when email is filled', async () => {
    render(
      <FormWrapper defaultValues={{ email: 'test@example.com' }}>
        <StakeholderContactTab readOnly={false} />
      </FormWrapper>,
    )

    expect(screen.getByRole('textbox', { name: /email.*2nd/i })).toBeInTheDocument()
  })

  it('hides email3 when email2 is empty', async () => {
    render(
      <FormWrapper defaultValues={{ email: 'test@example.com' }}>
        <StakeholderContactTab readOnly={false} />
      </FormWrapper>,
    )

    expect(screen.queryByRole('textbox', { name: /email.*3rd/i })).not.toBeInTheDocument()
  })

  it('shows email3 when email2 is filled', async () => {
    render(
      <FormWrapper defaultValues={{ email: 'test@example.com', email2: 'test2@example.com' }}>
        <StakeholderContactTab readOnly={false} />
      </FormWrapper>,
    )

    expect(screen.getByRole('textbox', { name: /email.*3rd/i })).toBeInTheDocument()
  })

  it('shows email2 field after user types into email field', async () => {
    const user = userEvent.setup()
    render(
      <FormWrapper>
        <StakeholderContactTab readOnly={false} />
      </FormWrapper>,
    )

    const emailInput = screen.getByRole('textbox', { name: /^email$/i })
    await user.type(emailInput, 'a@b.com')

    expect(screen.getByRole('textbox', { name: /email.*2nd/i })).toBeInTheDocument()
  })
})

describe('StakeholderContactTab — conditional phone fields', () => {
  it('hides phone2 when phone is empty', () => {
    render(
      <FormWrapper>
        <StakeholderContactTab readOnly={false} />
      </FormWrapper>,
    )

    expect(screen.queryByRole('textbox', { name: /phone.*2nd/i })).not.toBeInTheDocument()
  })

  it('shows phone2 when phone is filled', () => {
    render(
      <FormWrapper defaultValues={{ phone: '+49 123 456789' }}>
        <StakeholderContactTab readOnly={false} />
      </FormWrapper>,
    )

    expect(screen.getByRole('textbox', { name: /phone.*2nd/i })).toBeInTheDocument()
  })

  it('hides phone3 when phone2 is empty', () => {
    render(
      <FormWrapper defaultValues={{ phone: '+49 123 456789' }}>
        <StakeholderContactTab readOnly={false} />
      </FormWrapper>,
    )

    expect(screen.queryByRole('textbox', { name: /phone.*3rd/i })).not.toBeInTheDocument()
  })

  it('shows phone3 when phone2 is filled', () => {
    render(
      <FormWrapper defaultValues={{ phone: '+49 123 456789', phone2: '+49 987 654321' }}>
        <StakeholderContactTab readOnly={false} />
      </FormWrapper>,
    )

    expect(screen.getByRole('textbox', { name: /phone.*3rd/i })).toBeInTheDocument()
  })
})

describe('StakeholderContactTab — readOnly mode', () => {
  it('disables all visible fields when readOnly=true', () => {
    render(
      <FormWrapper
        defaultValues={{
          email: 'test@example.com',
          email2: 'test2@example.com',
          phone: '+49 123 456789',
          phone2: '+49 987 654321',
        }}
      >
        <StakeholderContactTab readOnly={true} />
      </FormWrapper>,
    )

    const textboxes = screen.getAllByRole('textbox')
    for (const textbox of textboxes) {
      expect(textbox).toBeDisabled()
    }
  })

  it('fields are enabled when readOnly=false', () => {
    render(
      <FormWrapper>
        <StakeholderContactTab readOnly={false} />
      </FormWrapper>,
    )

    const emailInput = screen.getByRole('textbox', { name: /^email$/i })
    expect(emailInput).not.toBeDisabled()
  })
})
