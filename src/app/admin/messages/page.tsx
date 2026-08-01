import { getAdminMessages } from '@/data/contact'
import { notificationsReachOwner } from '@/lib/notify'
import { toIsoString } from '@/lib/format'

import { EmptyState } from '@/components/ui'
import { AdminShell } from '@/components/admin/admin-shell'
import { DeleteButton } from '@/components/admin/delete-button'

import { deleteMessageAction } from './actions'
import { ToggleReadButton } from './message-actions'

export const dynamic = 'force-dynamic'

/** Tanggal di admin selalu zona Jakarta, sama seperti sisi publik. */
const formatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Jakarta',
})

export default async function AdminMessagesPage() {
  const messages = await getAdminMessages()

  return (
    <AdminShell
      title="Pesan Masuk"
      description="Dari form kontak publik. Alamat IP pengirim tidak disimpan."
    >
      {/*
        Peringatan ini ada supaya pemiliknya TIDAK mengira ia akan dikabari.
        Menyembunyikannya berarti membiarkan pesan recruiter mengendap
        berhari-hari karena tidak ada yang tahu ia masuk.
      */}
      {notificationsReachOwner ? null : (
        <p
          role="status"
          className="mb-6 rounded-xl border border-warning bg-elevated px-4 py-3 text-sm"
        >
          <strong className="font-medium">
            Tidak ada pemberitahuan otomatis.
          </strong>{' '}
          Pesan baru hanya terlihat di halaman ini dan pada lencana di
          navigasi — tidak ada email yang dikirim. Memasang penyedia email
          menuntut satu keputusan; lihat{' '}
          <code className="font-mono text-xs">src/lib/notify/index.ts</code>.
        </p>
      )}

      {messages.length === 0 ? (
        <EmptyState
          title="Belum ada pesan"
          description="Pesan dari form kontak akan muncul di sini."
        />
      ) : (
        <ul className="space-y-4">
          {messages.map((message) => (
            <li
              key={message.id}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{message.name}</p>
                    {!message.isRead ? (
                      <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                        Baru
                      </span>
                    ) : null}
                    <span className="rounded-full bg-elevated px-2.5 py-0.5 text-xs uppercase text-muted">
                      {message.locale}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-muted">
                    <a
                      href={`mailto:${message.email}`}
                      className="hover:underline"
                    >
                      {message.email}
                    </a>
                    {message.company ? ` · ${message.company}` : ''}
                  </p>
                </div>

                <time
                  dateTime={toIsoString(message.createdAt)}
                  className="shrink-0 text-sm text-muted"
                >
                  {formatter.format(message.createdAt)}
                </time>
              </div>

              {message.subject ? (
                <p className="mt-4 text-sm font-medium">{message.subject}</p>
              ) : null}

              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
                {message.message}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                <ToggleReadButton id={message.id} isRead={message.isRead} />
                <DeleteButton id={message.id} action={deleteMessageAction} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  )
}
