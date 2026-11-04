import { Phone } from 'lucide-react'
import { Photo } from './Photo'
import { LeadForm } from './LeadForm'
import { SITE } from '@/content/site'

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden border-b border-slate-100">
      {/* Full-bleed background photo, with a dark gradient so white text and
          the form card stay readable over any image dropped into this slot. */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-hero-zoom absolute inset-0">
          <Photo id="heroBackground" fill preload className="h-full w-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-slate-950/30" />
      </div>

      <div className="mx-auto grid min-h-[600px] max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-300">
            Tampa Bay Relocation Specialist
          </p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
            Moving to Tampa from anywhere in the US? Start here.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-200">
            I&apos;m {SITE.agentName}, a licensed Tampa-area real estate agent who specializes in
            helping people relocate here from out of state — the neighborhoods, the flood zones,
            the costs nobody mentions until you&apos;re already here.
          </p>
          <p className="mt-3 max-w-xl text-slate-300">
            Whether you&apos;re moving to Florida for a job, retiring to Tampa Bay, or coordinating
            a parent&apos;s move from out of state, I handle the local side of it from the first
            call through closing day — not just the paperwork.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {['Out-of-State Buyers', 'Retirees & Snowbirds', 'Remote Workers', 'Family Relocations'].map((tag, i) => (
              <span
                key={tag}
                style={{ animationDelay: `${i * 100}ms` }}
                className="animate-chip-in cursor-default rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-inset ring-white/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20 hover:ring-white/40"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-8">
            <a
              href={`tel:${SITE.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <Phone className="h-5 w-5" strokeWidth={2.5} />
              Call {SITE.phoneDisplay}
            </a>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm lg:max-w-none">
          <p className="mb-2 text-center text-base font-semibold text-white drop-shadow-sm">
            Get the Free Tampa Relocation Guide
          </p>
          <LeadForm
            variant="compact"
            source="Hero guide form"
            className="shadow-2xl shadow-black/50 ring-1 ring-black/5 lg:-rotate-1"
          />
        </div>
      </div>
    </section>
  )
}
