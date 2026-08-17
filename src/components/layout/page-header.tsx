import { type ReactNode } from 'react'

import { Container } from './container'
import { Reveal } from '@/components/motion'

type PageHeaderProps = {
  title: string
  /** Label mono di atas judul, mis. "STUDI KASUS". */
  kicker?: string
  description?: string
  /** Bahasa `description` bila berbeda dari locale halaman. */
  descriptionLang?: string
  children?: ReactNode
}

/** Kepala halaman untuk seluruh rute portofolio selain beranda. */
export function PageHeader({
  title,
  kicker,
  description,
  descriptionLang,
  children,
}: PageHeaderProps) {
  return (
    <Container as="header" className="pb-12 pt-16 sm:pt-20 md:pb-16 md:pt-24">
      <Reveal className="max-w-none">
        {kicker ? <p className="kicker mb-5">{kicker}</p> : null}
        <h1 className="font-display text-h1">{title}</h1>
        {description ? (
          <p
            lang={descriptionLang}
            className="mt-6 max-w-[62ch] leading-relaxed text-muted"
          >
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </Reveal>
    </Container>
  )
}
