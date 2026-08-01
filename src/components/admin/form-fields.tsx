import { type ReactNode } from 'react'

import { cn } from '@/lib/cn'
import { Input, Label, Textarea } from '@/components/ui'
import { toIsoString, type DateLike } from '@/lib/format'
import {
  PUBLISH_STATUS_LABEL,
  type PublishStatusValue,
} from '@/lib/schemas/admin'

type BaseProps = {
  name: string
  label: string
  error?: string
  hint?: string
  required?: boolean
}

function FieldWrapper({
  name,
  label,
  error,
  hint,
  required,
  children,
}: BaseProps & { children: ReactNode }) {
  return (
    <div>
      <Label htmlFor={name} className="block">
        {label} {required ? <span aria-hidden>*</span> : null}
      </Label>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${name}-error`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function TextField({
  defaultValue,
  type = 'text',
  ...props
}: BaseProps & { defaultValue?: string | null; type?: string }) {
  return (
    <FieldWrapper {...props}>
      <Input
        id={props.name}
        name={props.name}
        type={type}
        defaultValue={defaultValue ?? ''}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={props.error ? `${props.name}-error` : undefined}
      />
    </FieldWrapper>
  )
}

export function TextAreaField({
  defaultValue,
  rows = 4,
  ...props
}: BaseProps & { defaultValue?: string | null; rows?: number }) {
  return (
    <FieldWrapper {...props}>
      <Textarea
        id={props.name}
        name={props.name}
        rows={rows}
        defaultValue={defaultValue ?? ''}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={props.error ? `${props.name}-error` : undefined}
      />
    </FieldWrapper>
  )
}

/** Daftar satu item per baris — dipakai untuk tools, skill, pencapaian. */
export function ListField({
  defaultValue,
  ...props
}: BaseProps & { defaultValue?: string[] | null }) {
  return (
    <TextAreaField
      {...props}
      hint={props.hint ?? 'Satu item per baris.'}
      defaultValue={(defaultValue ?? []).join('\n')}
    />
  )
}

export function DateField({
  defaultValue,
  ...props
}: BaseProps & { defaultValue?: DateLike | null }) {
  // <input type="date"> menuntut format YYYY-MM-DD.
  const value = defaultValue ? toIsoString(defaultValue).slice(0, 10) : ''

  return (
    <FieldWrapper {...props}>
      <Input
        id={props.name}
        name={props.name}
        type="date"
        defaultValue={value}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={props.error ? `${props.name}-error` : undefined}
      />
    </FieldWrapper>
  )
}

export function CheckboxField({
  name,
  label,
  defaultChecked,
  hint,
  resetOnSuccess = false,
}: {
  name: string
  label: string
  defaultChecked?: boolean
  hint?: string
  /**
   * Kosongkan lagi setelah form berhasil dikirim. Untuk centang yang
   * maknanya "saya sudah memeriksa sekarang", bukan setelan yang menetap.
   * Ditangani `FormShell`.
   */
  resetOnSuccess?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={name}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        data-reset-on-success={resetOnSuccess ? '' : undefined}
        className={cn(
          'mt-1 h-4 w-4 rounded border-border',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        )}
      />
      <div>
        <Label htmlFor={name}>{label}</Label>
        {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
      </div>
    </div>
  )
}

/**
 * Select biasa. Tanpa `value`/`onChange` ia tak terkendali (uncontrolled)
 * seperti field lain; dengan keduanya ia terkendali, dipakai saat nilainya
 * ikut mengubah tampilan form (mis. tipe dokumen menentukan kerangka
 * template yang ditawarkan editor).
 */
export function SelectField({
  defaultValue,
  value,
  onChange,
  options,
  ...props
}: BaseProps & {
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <FieldWrapper {...props}>
      <select
        id={props.name}
        name={props.name}
        defaultValue={onChange ? undefined : defaultValue}
        value={onChange ? value : undefined}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={props.error ? `${props.name}-error` : undefined}
        className={selectClass}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  )
}

const selectClass = cn(
  'w-full rounded-xl border border-border bg-surface px-4 py-2.5',
  'text-foreground',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
)

export function StatusField({
  defaultValue = 'DRAFT',
  error,
}: {
  defaultValue?: PublishStatusValue
  error?: string
}) {
  return (
    <FieldWrapper
      name="status"
      label="Status"
      error={error}
      required
      hint="Hanya status Terbit yang tampil di situs publik."
    >
      <select
        id="status"
        name="status"
        defaultValue={defaultValue}
        className={selectClass}
      >
        {(
          Object.keys(PUBLISH_STATUS_LABEL) as PublishStatusValue[]
        ).map((value) => (
          <option key={value} value={value}>
            {PUBLISH_STATUS_LABEL[value]}
          </option>
        ))}
      </select>
    </FieldWrapper>
  )
}

export function StatusBadge({ status }: { status: PublishStatusValue }) {
  const tone: Record<PublishStatusValue, string> = {
    DRAFT: 'bg-elevated text-muted',
    IN_REVIEW: 'bg-warning text-white',
    PUBLISHED: 'bg-success text-white',
    ARCHIVED: 'bg-elevated text-muted line-through',
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        tone[status],
      )}
    >
      {PUBLISH_STATUS_LABEL[status]}
    </span>
  )
}
