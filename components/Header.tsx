import { Phone } from 'lucide-react'
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
        <a href="#top" className="shrink-0 text-lg font-bold tracking-tight text-slate-900">
          Carlos Simoni
          <span className="ml-2 hidden text-sm font-normal text-slate-500 sm:inline">| Tampa Relocation Specialist</span>
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
