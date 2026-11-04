import { Phone, FileText } from 'lucide-react'
import { Photo } from './Photo'
import { SITE } from '@/content/site'

export function Hero() {
  return (
    <section id="top" className="border-b border-slate-100 bg-gradient-to-b from-blue-50 to-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-700">
            Tampa Bay Relocation Specialist
          </p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Moving to Tampa from anywhere in the US? Start here.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600">
            I&apos;m {SITE.agentName}, a licensed Tampa-area real estate agent who specializes in
            helping people relocate here from out of state — the neighborhoods, the flood zones,
            the costs nobody mentions until you&apos;re already here.
          </p>
          <p className="mt-3 max-w-xl text-slate-600">
            Whether you&apos;re moving to Florida for a job, retiring to Tampa Bay, or coordinating
            a parent&apos;s move from out of state, I handle the local side of it from the first
            call through closing day — not just the paperwork.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {['Out-of-State Buyers', 'Retirees & Snowbirds', 'Remote Workers', 'Family Relocations'].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={`tel:${SITE.phoneTel}`}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <Phone className="h-5 w-5" strokeWidth={2.5} />
              Call {SITE.phoneDisplay}
            </a>
            <a
              href="#contact"
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-slate-900 px-6 py-3.5 text-base font-semibold text-slate-900 transition-colors hover:bg-slate-900 hover:text-white"
            >
              <FileText className="h-5 w-5" strokeWidth={2.5} />
              Get the Free Relocation Guide
            </a>
          </div>

          <p className="mt-4 text-sm text-slate-500">No cost, no obligation — just a straight answer.</p>
        </div>

        <div className="mx-auto w-full max-w-sm md:max-w-none">
          <Photo id="heroCarlos" preload className="w-full rounded-2xl shadow-lg" />
        </div>
      </div>
    </section>
  )
}
