import { Fragment, type ReactNode } from 'react'

import { cn } from '@/lib/cn'
import { CodeBlock } from '@/components/knowledge/code-block'

import { assignHeadingIds, nodeText } from './headings'
import { safeImageSrc, safeLink } from './safe-url'
import type { ProseMirrorDocument, ProseMirrorNode } from './types'

/**
 * Render dokumen ProseMirror menjadi React.
 *
 * TIDAK PERNAH menyisipkan HTML mentah — tidak ada `dangerouslySetInnerHTML`
 * di berkas ini, dan kolom `contentIdHtml` di database tidak pernah dibaca
 * untuk merender halaman publik (07_SCHEMA_DECISIONS §6). Node yang tidak
 * dikenal dilewati diam-diam: kehilangan satu blok jauh lebih baik daripada
 * seluruh halaman gagal render.
 */

type RenderContext = {
  /** Id heading dalam urutan dokumen, dipakai berurutan saat render. */
  headingIds: string[]
  headingCursor: { index: number }
}

function renderMarks(node: ProseMirrorNode, children: ReactNode): ReactNode {
  if (!node.marks || node.marks.length === 0) return children

  // Mark diterapkan dari dalam ke luar supaya urutan bersarangnya stabil.
  return node.marks.reduce<ReactNode>((acc, mark) => {
    switch (mark.type) {
      case 'bold':
      case 'strong':
        return <strong className="font-semibold">{acc}</strong>
      case 'italic':
      case 'em':
        return <em>{acc}</em>
      case 'strike':
        return <s>{acc}</s>
      case 'underline':
        return <u>{acc}</u>
      case 'subscript':
        return <sub>{acc}</sub>
      case 'superscript':
        return <sup>{acc}</sup>
      case 'code':
        return (
          <code className="rounded-md bg-elevated px-1.5 py-0.5 font-mono text-[0.9em]">
            {acc}
          </code>
        )
      case 'link': {
        const link = safeLink(mark.attrs?.href)

        // Tautan dengan skema terlarang kehilangan href-nya, teksnya tetap.
        if (!link) return acc

        return (
          <a
            href={link.href}
            {...(link.isExternal
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
            className="rounded-sm font-medium text-primary underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {acc}
          </a>
        )
      }
      default:
        return acc
    }
  }, children)
}

function renderChildren(
  nodes: ProseMirrorNode[] | undefined,
  ctx: RenderContext,
): ReactNode {
  if (!nodes) return null

  return nodes.map((child, index) => (
    <Fragment key={index}>{renderNode(child, ctx)}</Fragment>
  ))
}

function renderNode(node: ProseMirrorNode, ctx: RenderContext): ReactNode {
  switch (node.type) {
    case 'text':
      return renderMarks(node, node.text ?? '')

    case 'hardBreak':
      return <br />

    case 'paragraph':
      return (
        <p className="my-4 hyphens-auto text-justify leading-relaxed">{renderChildren(node.content, ctx)}</p>
      )

    case 'heading': {
      const level = typeof node.attrs?.level === 'number' ? node.attrs.level : 1
      const id = ctx.headingIds[ctx.headingCursor.index]

      ctx.headingCursor.index += 1

      const Tag = (`h${Math.min(Math.max(level, 1), 6)}`) as 'h2'
      const size =
        level <= 2
          ? 'mt-12 text-xl md:text-2xl'
          : level === 3
            ? 'mt-10 text-lg md:text-xl'
            : 'mt-8 text-base md:text-lg'

      return (
        <Tag
          id={id}
          className={cn(
            'scroll-mt-28 font-display font-semibold tracking-tight',
            size,
          )}
        >
          {renderChildren(node.content, ctx)}
        </Tag>
      )
    }

    case 'bulletList':
      return (
        <ul className="my-4 list-disc space-y-2 pl-6 marker:text-muted">
          {renderChildren(node.content, ctx)}
        </ul>
      )

    case 'orderedList': {
      const start =
        typeof node.attrs?.start === 'number' ? node.attrs.start : undefined

      return (
        <ol
          start={start}
          className="my-4 list-decimal space-y-2 pl-6 marker:text-muted"
        >
          {renderChildren(node.content, ctx)}
        </ol>
      )
    }

    case 'listItem':
      // `[&>p]:my-0` menjaga jarak baris di dalam butir tetap rapat —
      // paragraf di dalam <li> kalau tidak akan membawa margin penuh.
      return (
        <li className="leading-relaxed [&>p]:my-0">
          {renderChildren(node.content, ctx)}
        </li>
      )

    case 'taskList':
      return (
        <ul className="my-4 space-y-2 pl-1">{renderChildren(node.content, ctx)}</ul>
      )

    case 'taskItem':
      return (
        <li className="flex items-start gap-3 leading-relaxed [&>p]:my-0">
          <input
            type="checkbox"
            checked={node.attrs?.checked === true}
            readOnly
            // Daftar tugas di dokumen terbit adalah CATATAN, bukan kontrol.
            // Dinonaktifkan dari tab order supaya tidak menjebak keyboard.
            tabIndex={-1}
            className="mt-1.5 h-4 w-4 shrink-0 rounded border-border"
          />
          <span>{renderChildren(node.content, ctx)}</span>
        </li>
      )

    case 'blockquote':
      return (
        <blockquote className="my-6 border-l-4 border-border pl-5 italic text-muted">
          {renderChildren(node.content, ctx)}
        </blockquote>
      )

    case 'horizontalRule':
      return <hr className="my-10 border-border" />

    case 'codeBlock': {
      const language =
        typeof node.attrs?.language === 'string' ? node.attrs.language : null

      return <CodeBlock code={nodeText(node)} language={language} />
    }

    case 'image': {
      const src = safeImageSrc(node.attrs?.src)

      if (!src) return null

      const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : ''
      const caption =
        typeof node.attrs?.title === 'string' ? node.attrs.title : null

      return (
        <figure className="my-8">
          {/* eslint-disable-next-line @next/next/no-img-element -- dimensi
              gambar tidak tersimpan di dokumen, dan `images.remotePatterns`
              baru diisi di Fase 5. Diganti next/image saat itu. */}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="w-full rounded-2xl border border-border"
          />
          {caption ? (
            <figcaption className="mt-2 text-center text-sm text-muted">
              {caption}
            </figcaption>
          ) : null}
        </figure>
      )
    }

    case 'table':
      // Tabel jaringan (rencana IP, VLAN) hampir selalu lebih lebar dari
      // layar ponsel. Pembungkus bergulir sendiri supaya HALAMAN tidak
      // ikut bergulir mendatar.
      return (
        <div
          role="region"
          aria-label="Tabel"
          tabIndex={0}
          className="my-6 overflow-x-auto rounded-2xl border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <table className="w-full border-collapse text-sm">
            <tbody>{renderChildren(node.content, ctx)}</tbody>
          </table>
        </div>
      )

    case 'tableRow':
      return (
        <tr className="border-b border-border last:border-0">
          {renderChildren(node.content, ctx)}
        </tr>
      )

    case 'tableHeader':
      return (
        <th
          colSpan={typeof node.attrs?.colspan === 'number' ? node.attrs.colspan : undefined}
          rowSpan={typeof node.attrs?.rowspan === 'number' ? node.attrs.rowspan : undefined}
          scope="col"
          className="bg-elevated px-4 py-3 text-left font-semibold [&>p]:my-0"
        >
          {renderChildren(node.content, ctx)}
        </th>
      )

    case 'tableCell':
      return (
        <td
          colSpan={typeof node.attrs?.colspan === 'number' ? node.attrs.colspan : undefined}
          rowSpan={typeof node.attrs?.rowspan === 'number' ? node.attrs.rowspan : undefined}
          className="px-4 py-3 align-top [&>p]:my-0"
        >
          {renderChildren(node.content, ctx)}
        </td>
      )

    default:
      // Node tak dikenal: render isinya kalau ada, supaya teksnya tidak
      // hilang hanya karena pembungkusnya belum didukung.
      return node.content ? renderChildren(node.content, ctx) : null
  }
}

export function ProseMirrorContent({
  doc,
  className,
}: {
  doc: ProseMirrorDocument
  className?: string
}) {
  const ctx: RenderContext = {
    headingIds: assignHeadingIds(doc).map((heading) => heading.id),
    headingCursor: { index: 0 },
  }

  return (
    <div className={cn('max-w-none text-base text-foreground', className)}>
      {renderChildren(doc.content, ctx)}
    </div>
  )
}
