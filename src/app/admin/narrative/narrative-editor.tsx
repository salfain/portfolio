'use client'

import { FormShell } from '@/components/admin/form-shell'
import { TextAreaField } from '@/components/admin/form-fields'
import { toNarrativeText } from '@/lib/narrative-format'
import type { NarrativeBlock } from '@/lib/schemas/site-settings'

import { saveNarrativeAction } from './actions'

type NarrativeEditorProps = {
  sectionKey:
    'home.whyWorkWithMe' | 'home.troubleshootingProcess' | 'about.story'
  blocks: NarrativeBlock[]
}

export function NarrativeEditor({ sectionKey, blocks }: NarrativeEditorProps) {
  return (
    <FormShell action={saveNarrativeAction}>
      {(errors) => (
        <>
          <input type="hidden" name="key" value={sectionKey} />

          <TextAreaField
            name="blocksId"
            label="Blok (Indonesia)"
            rows={10}
            hint="Satu blok per paragraf, dipisah baris kosong. Judul dan isi dipisah tanda |"
            defaultValue={toNarrativeText(blocks, 'id')}
            error={errors.blocksId}
          />

          <TextAreaField
            name="blocksEn"
            label="Blok (Inggris)"
            rows={10}
            hint="Kosongkan, atau isi dengan jumlah blok yang sama persis dan urutan yang sama."
            defaultValue={toNarrativeText(blocks, 'en')}
            error={errors.blocksEn}
          />
        </>
      )}
    </FormShell>
  )
}
