import { Quote } from 'lucide-react'

// Real clients only — see the standing rule at the bottom of this file.
// `name` can be a full name or initials depending on what that person
// agreed to; `detail` is the one-line attribution under the quote.
const TESTIMONIALS = [
  {
    name: 'Robert P.',
    detail: 'Relocated from Illinois',
    quote:
      "When I moved down from Illinois, I expected a real estate agent — what I got was someone who actually showed up. Carlos didn't just help me find the right house, he was there on move-in day helping carry boxes. That's not something you get from just anyone.",
  },
  {
    name: 'Jennifer M.',
    detail: 'Relocated from Chicago',
    quote:
      'Carlos made our move from Chicago feel manageable from day one. He explained the neighborhoods honestly, flagged insurance and flood-zone concerns, and handled video walkthroughs while we were still out of state. We never felt pressured or out of the loop.',
  },
  {
    name: 'Jerry W.',
    detail: 'Relocated from Seattle',
    quote:
      'We had very little knowledge of the Tampa area, but Carlos quickly narrowed our search based on our commute, budget, and priorities. His local insight saved us weeks of research, and he stayed responsive throughout the inspection and closing process.',
  },
  {
    name: 'Amanda and David L.',
    detail: 'Relocated from New Jersey',
    quote:
      'Carlos treated our move like more than a home search. He helped us compare communities, understand the true monthly costs, and feel confident buying from another state. By closing day, we felt like we already knew the area.',
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

        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="rounded-xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/60"
            >
              <Quote className="h-6 w-6 text-blue-400" strokeWidth={2} />
              <blockquote className="mt-3 text-sm leading-relaxed text-slate-700">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-slate-900">
                {t.name}
                <span className="block text-xs font-normal text-slate-500">{t.detail}</span>
              </figcaption>
            </figure>
          ))}
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
