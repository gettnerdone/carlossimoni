import { Phone } from 'lucide-react'
import Image from 'next/image'
import { SITE } from '@/content/site'

const NAV_LINKS = [
  { href: '#why-tampa', label: 'Why Tampa' },
  { href: '#neighborhoods', label: 'Neighborhoods' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#faq', label: 'FAQ' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#top" aria-label="Carlos Simoni — Tampa Relocation Specialist" className="shrink-0">
          <Image
            src="/carlos-simoni-logo.svg"
            alt="Carlos Simoni — Tampa Relocation Specialist"
            width={430}
            height={64}
            className="h-auto w-[210px] sm:w-[300px]"
            unoptimized
          />
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-slate-900">
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href={`tel:${SITE.phoneTel}`}
          className="flex shrink-0 items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Phone className="h-4 w-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">{SITE.phoneDisplay}</span>
          <span className="sm:hidden">Call</span>
        </a>
      </div>
    </header>
  )
}
