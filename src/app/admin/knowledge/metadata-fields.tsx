'use client'

import {
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/admin/form-fields'
import {
  DEVICE_KEYS,
  FAULT_KEYS,
  IP_PLAN_KEYS,
  TEST_CASE_KEYS,
  TIMELINE_KEYS,
  VLAN_KEYS,
  toTableText,
} from '@/lib/knowledge-metadata'
import {
  INCIDENT_LEVELS,
  INCIDENT_PRIORITIES,
  parseIncidentMetadata,
  parseLabMetadata,
  parseSopMetadata,
} from '@/lib/schemas/knowledge-metadata'
import type { KnowledgeTypeValue } from '@/lib/schemas/admin'

type Errors = Record<string, string>

const LEVEL_LABEL: Record<string, string> = {
  low: 'Rendah',
  medium: 'Sedang',
  high: 'Tinggi',
}

/**
 * Isian khusus per tipe dokumen.
 *
 * Tabel diketik satu entri per baris dengan kolom dipisah `|`. Antarmuka
 * array dinamis akan lebih rapi dilihat, tapi lebih lambat dipakai untuk
 * mengisi sepuluh baris rencana IP — dan pola teks ini sudah dipakai
 * bagian naratif, jadi tidak ada cara baru yang perlu dipelajari.
 */
export function MetadataFields({
  type,
  metadata,
  errors,
}: {
  type: KnowledgeTypeValue
  metadata: unknown
  errors: Errors
}) {
  if (type === 'LAB') return <LabFields metadata={metadata} errors={errors} />
  if (type === 'INCIDENT')
    return <IncidentFields metadata={metadata} errors={errors} />
  if (type === 'SOP') return <SopFields metadata={metadata} errors={errors} />

  return null
}

function SopFields({ metadata, errors }: { metadata: unknown; errors: Errors }) {
  const meta = parseSopMetadata(metadata)

  return (
    <fieldset className="space-y-6 rounded-3xl border border-border p-6">
      <legend className="px-2 text-sm font-medium">Rincian SOP</legend>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          name="metaScope"
          label="Ruang lingkup"
          hint="Mis. Windows endpoint."
          defaultValue={meta?.scope}
          error={errors.metaScope}
        />
        <TextField
          name="metaOwner"
          label="Pemilik prosedur"
          defaultValue={meta?.owner}
          error={errors.metaOwner}
        />
      </div>

      <SelectField
        name="metaRiskLevel"
        label="Tingkat risiko"
        defaultValue={meta?.riskLevel ?? ''}
        options={[
          { value: '', label: '— tidak ditentukan —' },
          ...Object.entries(LEVEL_LABEL).map(([value, label]) => ({
            value,
            label,
          })),
        ]}
        error={errors.metaRiskLevel}
      />
    </fieldset>
  )
}

function LabFields({ metadata, errors }: { metadata: unknown; errors: Errors }) {
  const meta = parseLabMetadata(metadata)

  return (
    <fieldset className="space-y-6 rounded-3xl border border-border p-6">
      <legend className="px-2 text-sm font-medium">Rincian lab</legend>
      <p className="text-xs text-muted">
        Setiap tabel diisi satu entri per baris, kolom dipisah tanda{' '}
        <code className="font-mono">|</code>. Kolom yang tidak diisi boleh
        dikosongkan; baris tanpa kolom pertama diabaikan.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          name="metaTopology"
          label="Topologi"
          hint="Ringkas, mis. HQ dan satu cabang."
          defaultValue={meta?.topology}
          error={errors.metaTopology}
        />
        <TextField
          name="metaEstimatedHours"
          label="Perkiraan waktu pengerjaan (jam)"
          type="number"
          defaultValue={meta?.estimatedHours?.toString()}
          error={errors.metaEstimatedHours}
        />
      </div>

      <TextAreaField
        name="metaDevices"
        label="Inventaris perangkat"
        rows={5}
        hint="nama | peran | model | catatan"
        defaultValue={toTableText(meta?.devices, DEVICE_KEYS)}
        error={errors.metaDevices}
      />

      <TextAreaField
        name="metaVlans"
        label="Rencana VLAN"
        rows={4}
        hint="id | nama | fungsi"
        defaultValue={toTableText(meta?.vlans, VLAN_KEYS)}
        error={errors.metaVlans}
      />

      <TextAreaField
        name="metaIpPlan"
        label="Rencana pengalamatan IP"
        rows={5}
        hint="segmen | cidr | vlan | gateway"
        defaultValue={toTableText(meta?.ipPlan, IP_PLAN_KEYS)}
        error={errors.metaIpPlan}
      />

      <TextAreaField
        name="metaTestCases"
        label="Kasus uji"
        rows={5}
        hint="id | yang diuji | hasil diharapkan | hasil sebenarnya | status (lulus / gagal / terhalang)"
        defaultValue={toTableText(meta?.testCases, TEST_CASE_KEYS)}
        error={errors.metaTestCases}
      />

      <TextAreaField
        name="metaFaults"
        label="Simulasi gangguan"
        rows={4}
        hint="skenario | dampak diharapkan | dampak sebenarnya | pemulihan"
        defaultValue={toTableText(meta?.faults, FAULT_KEYS)}
        error={errors.metaFaults}
      />
    </fieldset>
  )
}

function IncidentFields({
  metadata,
  errors,
}: {
  metadata: unknown
  errors: Errors
}) {
  const meta = parseIncidentMetadata(metadata)

  return (
    <>
      {/**
       * Asal insiden ditanya lebih dulu dan TIDAK punya nilai awal.
       *
       * Menyajikan skenario lab sebagai insiden produksi adalah mengarang
       * pengalaman, dan itu akan langsung terlihat oleh pewawancara teknis.
       * Pilihan kosong berarti form ditolak — bukan diam-diam menjawab
       * "nyata" atas nama penulisnya.
       */}
      <fieldset className="space-y-4 rounded-3xl border border-warning p-6">
        <legend className="px-2 text-sm font-medium">Asal insiden</legend>
        <p className="text-xs text-muted">
          Wajib dijawab. Insiden yang direproduksi di lab akan diberi penanda
          jelas di halaman publiknya.
        </p>

        <SelectField
          name="metaIsLabReproduction"
          label="Insiden ini berasal dari"
          required
          defaultValue={
            meta === null
              ? ''
              : meta.isLabReproduction
                ? 'lab'
                : 'nyata'
          }
          options={[
            { value: '', label: '— pilih salah satu —' },
            { value: 'nyata', label: 'Kejadian nyata di tempat kerja' },
            { value: 'lab', label: 'Direproduksi di lab' },
          ]}
          error={errors.metaIsLabReproduction}
        />
      </fieldset>

      <fieldset className="space-y-6 rounded-3xl border border-border p-6">
        <legend className="px-2 text-sm font-medium">Rincian insiden</legend>

        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            name="metaNumber"
            label="Nomor insiden"
            hint="Opsional, mis. INC-2026-014."
            defaultValue={meta?.number}
            error={errors.metaNumber}
          />
          <TextField
            name="metaAffectedService"
            label="Layanan terdampak"
            defaultValue={meta?.affectedService}
            error={errors.metaAffectedService}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <SelectField
            name="metaPriority"
            label="Prioritas"
            defaultValue={meta?.priority ?? ''}
            options={[
              { value: '', label: '—' },
              ...INCIDENT_PRIORITIES.map((value) => ({ value, label: value })),
            ]}
            error={errors.metaPriority}
          />
          <SelectField
            name="metaImpact"
            label="Dampak"
            defaultValue={meta?.impact ?? ''}
            options={[
              { value: '', label: '—' },
              ...INCIDENT_LEVELS.map((value) => ({
                value,
                label: LEVEL_LABEL[value] ?? value,
              })),
            ]}
            error={errors.metaImpact}
          />
          <SelectField
            name="metaUrgency"
            label="Urgensi"
            defaultValue={meta?.urgency ?? ''}
            options={[
              { value: '', label: '—' },
              ...INCIDENT_LEVELS.map((value) => ({
                value,
                label: LEVEL_LABEL[value] ?? value,
              })),
            ]}
            error={errors.metaUrgency}
          />
        </div>

        <TextField
          name="metaResolutionMinutes"
          label="Waktu penyelesaian (menit)"
          type="number"
          hint="Isi HANYA bila waktunya benar-benar tercatat. Kosongkan bila tidak."
          defaultValue={meta?.resolutionMinutes?.toString()}
          error={errors.metaResolutionMinutes}
        />

        <TextAreaField
          name="metaTimeline"
          label="Kronologi"
          rows={6}
          hint="waktu | kejadian"
          defaultValue={toTableText(meta?.timeline, TIMELINE_KEYS)}
          error={errors.metaTimeline}
        />

        <TextField
          name="metaRelatedSopSlug"
          label="Slug SOP terkait"
          hint="Mis. sop-troubleshooting-tanpa-internet."
          defaultValue={meta?.relatedSopSlug}
          error={errors.metaRelatedSopSlug}
        />
      </fieldset>

      <fieldset className="space-y-6 rounded-3xl border border-border p-6">
        <legend className="px-2 text-sm font-medium">Analisis</legend>

        <AnalysisPair
          name="metaRootCause"
          label="Akar masalah"
          id={meta?.rootCauseId}
          en={meta?.rootCauseEn}
          errors={errors}
        />
        <AnalysisPair
          name="metaWorkaround"
          label="Solusi sementara"
          id={meta?.workaroundId}
          en={meta?.workaroundEn}
          errors={errors}
        />
        <AnalysisPair
          name="metaResolution"
          label="Penyelesaian"
          id={meta?.resolutionId}
          en={meta?.resolutionEn}
          errors={errors}
        />
        <AnalysisPair
          name="metaValidation"
          label="Validasi"
          id={meta?.validationId}
          en={meta?.validationEn}
          errors={errors}
        />
        <AnalysisPair
          name="metaPrevention"
          label="Pencegahan berulang"
          id={meta?.preventionId}
          en={meta?.preventionEn}
          errors={errors}
        />
      </fieldset>
    </>
  )
}

function AnalysisPair({
  name,
  label,
  id,
  en,
  errors,
}: {
  name: string
  label: string
  id: string | null | undefined
  en: string | null | undefined
  errors: Errors
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <TextAreaField
        name={`${name}Id`}
        label={`${label} (Indonesia)`}
        rows={3}
        defaultValue={id}
        error={errors[`${name}Id`]}
      />
      <TextAreaField
        name={`${name}En`}
        label={`${label} (Inggris)`}
        rows={3}
        defaultValue={en}
        error={errors[`${name}En`]}
      />
    </div>
  )
}
