import { getTranslations } from 'next-intl/server'

import { cn } from '@/lib/cn'
import { normalizeTestStatus, type TestStatus } from '@/lib/knowledge-metadata'
import type { LabMetadata } from '@/lib/schemas/knowledge-metadata'

import { EvidenceFacts, EvidenceTable } from './evidence-table'

/**
 * Blok bukti untuk dokumen tipe Lab.
 *
 * Semua isinya berasal dari `metadata` yang sudah divalidasi — komponen ini
 * tidak pernah menerima JSON mentah. Bagian yang tabelnya kosong tidak
 * dirender sama sekali: lab yang belum sempat mencatat rencana VLAN lebih
 * baik tidak menampilkan judul "Rencana VLAN" di atas ruang kosong.
 */
export async function LabBlocks({ meta }: { meta: LabMetadata }) {
  const t = await getTranslations('knowledge.lab')

  const hasAnything =
    meta.topology !== null ||
    meta.estimatedHours !== null ||
    meta.devices.length > 0 ||
    meta.vlans.length > 0 ||
    meta.ipPlan.length > 0 ||
    meta.testCases.length > 0 ||
    meta.faults.length > 0

  if (!hasAnything) return null

  return (
    <section className="mt-16" aria-labelledby="rincian-lab">
      <h2 id="rincian-lab" className="font-display text-2xl">
        {t('heading')}
      </h2>
      <p className="mt-2 text-sm text-muted">{t('note')}</p>

      <EvidenceFacts
        facts={[
          { label: t('topology'), value: meta.topology },
          {
            label: t('estimatedHours'),
            value:
              meta.estimatedHours === null
                ? null
                : t('hours', { hours: meta.estimatedHours }),
          },
        ]}
      />

      <EvidenceTable
        caption={t('devices')}
        headers={[
          t('deviceName'),
          t('deviceRole'),
          t('deviceModel'),
          t('deviceNote'),
        ]}
        rows={meta.devices.map((device) => [
          <span key="n" className="font-medium text-foreground">
            {device.name}
          </span>,
          device.role,
          <code key="m" className="font-mono text-xs">
            {device.model}
          </code>,
          device.note,
        ])}
      />

      <EvidenceTable
        caption={t('vlans')}
        headers={[t('vlanId'), t('vlanName'), t('vlanPurpose')]}
        rows={meta.vlans.map((vlan) => [
          <code key="i" className="font-mono text-xs text-foreground">
            {vlan.id}
          </code>,
          vlan.name,
          vlan.purpose,
        ])}
      />

      <EvidenceTable
        caption={t('ipPlan')}
        headers={[t('ipSegment'), t('ipCidr'), t('ipVlan'), t('ipGateway')]}
        rows={meta.ipPlan.map((row) => [
          <span key="s" className="font-medium text-foreground">
            {row.segment}
          </span>,
          <code key="c" className="font-mono text-xs">
            {row.cidr}
          </code>,
          row.vlan,
          <code key="g" className="font-mono text-xs">
            {row.gateway}
          </code>,
        ])}
      />

      <EvidenceTable
        caption={t('testCases')}
        headers={[
          t('testId'),
          t('testCheck'),
          t('testExpected'),
          t('testActual'),
          t('testStatus'),
        ]}
        rows={meta.testCases.map((test) => [
          <code key="i" className="font-mono text-xs text-foreground">
            {test.id}
          </code>,
          test.check,
          test.expected,
          test.actual,
          <StatusPill key="s" status={normalizeTestStatus(test.status)} />,
        ])}
      />

      <EvidenceTable
        caption={t('faults')}
        headers={[
          t('faultScenario'),
          t('faultExpected'),
          t('faultActual'),
          t('faultRecovery'),
        ]}
        rows={meta.faults.map((fault) => [
          <span key="s" className="font-medium text-foreground">
            {fault.scenario}
          </span>,
          fault.expected,
          fault.actual,
          fault.recovery,
        ])}
      />
    </section>
  )
}

/**
 * Status kasus uji.
 *
 * `unknown` tampil netral dan berbunyi "belum dicatat" — BUKAN hijau.
 * Status yang tidak terbaca lalu ditampilkan sebagai lulus akan mengubah
 * halaman bukti menjadi halaman klaim.
 */
async function StatusPill({ status }: { status: TestStatus }) {
  const t = await getTranslations('knowledge.lab.status')

  const tone: Record<TestStatus, string> = {
    pass: 'bg-success text-white',
    fail: 'bg-danger text-white',
    blocked: 'bg-warning text-white',
    unknown: 'bg-elevated text-muted',
  }

  return (
    <span
      className={cn(
        'inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium',
        tone[status],
      )}
    >
      {t(status)}
    </span>
  )
}
