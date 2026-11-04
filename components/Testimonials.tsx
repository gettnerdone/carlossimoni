import { Quote } from 'lucide-react'

// Real clients only — see the standing rule at the bottom of this file.
// `name` can be a full name or initials depending on what that person
// agreed to; `detail` is the one-line attribution under the quote.
const TESTIMONIALS = [
  {
    name: 'Robert Peterson',
    detail: 'Relocated from Illinois',
    quote:
      "When I moved down from Illinois, I expected a real estate agent — what I got was someone who actually showed up. Carlos didn't just help me find the right house, he was there on move-in day helping carry boxes. That's not something you get from just anyone.",
  },
] as const

export function Testimonials() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">What clients say</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-lg text-slate-600">
          Real relocations, from people who made the move.
        </p>

        <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="rounded-xl border border-slate-200 bg-white p-6">
              <Quote className="h-6 w-6 text-blue-400" strokeWidth={2} />
              <blockquote className="mt-3 text-sm leading-relaxed text-slate-700">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-slate-900">
                {t.name}
                <span className="block text-xs font-normal text-slate-500">{t.detail}</span>
              </figcaption>
            </figure>
          ))}

          {/* Placeholder card — remove once a second real testimonial is approved
              and added to TESTIMONIALS above. Keeps the grid from looking like a
              dead end with only one card next to empty space. */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
            More client stories coming soon.
          </div>
        </div>
      </div>
    </section>
  )
}

// No fabricated quotes here, ever — fake testimonials presented as genuine
// are both a trust problem and a legal one (FTC endorsement rules). Every
// entry above is drafted from real facts the person described, and must be
// reviewed and approved (sign-off on this exact wording, or their edits) by
// that actual person before it ships — not just assumed on their behalf.
