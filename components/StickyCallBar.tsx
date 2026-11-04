import { Phone, FileText } from 'lucide-react'
import { SITE } from '@/content/site'

// Mobile-only bottom bar — most "I'm researching a move" traffic here will
// be on a phone, so the two primary actions (call, or leave an email for
// the guide) stay reachable with a thumb at all times without eating screen
// space on desktop, where the header's call button already covers it.
export function StickyCallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden">
      <a
        href={`tel:${SITE.phoneTel}`}
        className="flex flex-1 items-center justify-center gap-2 bg-blue-600 py-3 text-sm font-semibold text-white"
      >
        <Phone className="h-4 w-4" strokeWidth={2.5} />
        Call Carlos
      </a>
      <a
        href="#contact"
        className="flex flex-1 items-center justify-center gap-2 bg-slate-900 py-3 text-sm font-semibold text-white"
      >
        <FileText className="h-4 w-4" strokeWidth={2.5} />
        Get the Guide
      </a>
    </div>
  )
}
