'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'

import type { Locale } from '@/i18n/routing'
import type { ContactState } from '@/lib/schemas/contact'
import { submitContact } from '@/app/[locale]/contact/actions'

import { Button, Input, Label, Textarea } from '@/components/ui'

type ContactFormProps = {
  locale: Locale
}

const initialState: ContactState = { status: 'idle' }

export function ContactForm({ locale }: ContactFormProps) {
  const t = useTranslations('contact')
  const [state, formAction, pending] = useActionState(
    submitContact,
    initialState,
  )

  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined

  /** Kode error dari Zod dipetakan ke kunci terjemahan. */
  const errorFor = (field: 'name' | 'email' | 'company' | 'subject' | 'message') => {
    const code = fieldErrors?.[field]

    return code ? t(`errors.${code}`) : undefined
  }

  if (state.status === 'success') {
    return (
      <div
        role="status"
        className="rounded-3xl border border-border bg-surface p-8 text-center"
      >
        <h2 className="font-display text-lg font-semibold">
          {t('successTitle')}
        </h2>
        <p className="mt-2 text-sm text-muted">{t('successDescription')}</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="locale" value={locale} />

      {/* Honeypot — tersembunyi dari manusia, terlihat oleh bot.
          `sr-only` tidak dipakai: pembaca layar tetap membacanya. */}
      <div aria-hidden className="hidden">
        <label htmlFor="website">{t('honeypot')}</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <Field
        id="name"
        label={t('name')}
        error={errorFor('name')}
        required
        autoComplete="name"
      />

      <Field
        id="email"
        type="email"
        label={t('email')}
        error={errorFor('email')}
        required
        autoComplete="email"
      />

      <Field
        id="company"
        label={t('company')}
        error={errorFor('company')}
        autoComplete="organization"
      />

      <Field
        id="subject"
        label={t('subject')}
        error={errorFor('subject')}
      />

      <div>
        <Label htmlFor="message">
          {t('message')} <span aria-hidden>*</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          rows={6}
          required
          aria-describedby={errorFor('message') ? 'message-error' : undefined}
          aria-invalid={errorFor('message') ? true : undefined}
          className="mt-2"
        />
        {errorFor('message') ? (
          <p id="message-error" className="mt-2 text-sm text-danger">
            {errorFor('message')}
          </p>
        ) : null}
      </div>

      {state.status === 'error' && state.code !== 'validation' ? (
        <p role="alert" className="text-sm text-danger">
          {t(`errors.${state.code}`)}
        </p>
      ) : null}

      <Button type="submit" size="lg" loading={pending}>
        {t('submit')}
      </Button>

      <p className="text-xs text-muted">{t('privacyNote')}</p>
    </form>
  )
}

type FieldProps = {
  id: 'name' | 'email' | 'company' | 'subject'
  label: string
  error?: string
  type?: string
  required?: boolean
  autoComplete?: string
}

function Field({
  id,
  label,
  error,
  type = 'text',
  required = false,
  autoComplete,
}: FieldProps) {
  return (
    <div>
      <Label htmlFor={id}>
        {label} {required ? <span aria-hidden>*</span> : null}
      </Label>
      <Input
        id={id}
        name={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? true : undefined}
        className="mt-2"
      />
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}
