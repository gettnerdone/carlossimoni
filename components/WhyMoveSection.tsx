import { Umbrella, Waves, Receipt } from 'lucide-react'
import { Reveal } from './Reveal'

const POINTS = [
  {
    icon: Umbrella,
    title: 'No state income tax — but budget for insurance',
    body:
      "Florida has no state income tax, and that's real money back in your pocket. What catches people off guard is homeowners and flood insurance — it can be a meaningful monthly cost here, so don't assume the tax savings alone means you're ahead. I'll help you run the real numbers on a specific property before you fall in love with it.",
  },
  {
    icon: Waves,
    title: 'Flood zone can change block to block',
    body:
      "Two houses a few streets apart can sit in completely different flood zones — and that affects both your insurance cost and resale value down the line. It's one of the first things I check on any property before we go further, not an afterthought at closing.",
  },
  {
    icon: Receipt,
    title: 'Watch for CDD fees on newer communities',
    body:
      "A lot of newer-build communities add a CDD (Community Development District) fee on top of the HOA. It's not hidden, but it's easy to miss if you're comparing a listing price against what you're used to elsewhere. I'll always point out when it applies so there are no surprises in your real monthly cost.",
  },
]

export function WhyMoveSection() {
  return (
    <section id="why-tampa" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          3 things nobody tells you about moving to Tampa
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          The stuff I walk every out-of-state client through before they ever make an offer.
        </p>

        <Reveal className="mt-10 grid gap-8 md:grid-cols-3">
          {POINTS.map((point) => (
            <div
              key={point.title}
              className="group rounded-xl border border-slate-200 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/60"
            >
              <point.icon
                className="h-8 w-8 text-blue-600 transition-transform duration-200 group-hover:scale-110"
                strokeWidth={1.75}
              />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{point.body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
