import { type ReactNode } from 'react'

import { Container } from './container'
import { Reveal } from '@/components/motion'

type PageHeaderProps = {
  title: string
  description?: string
  /** Bahasa `description` bila berbeda dari locale halaman. */
  descriptionLang?: string
  children?: ReactNode
}

/** Kepala halaman untuk seluruh rute portofolio selain beranda. */
export function PageHeader({
  title,
  description,
  descriptionLang,
  children,
}: PageHeaderProps) {
  return (
    <Container as="header" className="py-12 sm:py-14 md:py-20">
      <Reveal className="max-w-prose">
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description ? (
          <p
            lang={descriptionLang}
            className="mt-4 hyphens-auto text-justify text-base leading-relaxed text-muted md:text-lg"
          >
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </Reveal>
    </Container>
  )
}
