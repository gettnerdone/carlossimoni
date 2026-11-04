import { Home, Truck, FileSignature, Users } from 'lucide-react'

const ITEMS = [
  {
    icon: Home,
    title: 'Finding the right home, remotely',
    body: 'Video walkthroughs, honest feedback on properties, and a short list built around what actually matters to you — not a 40-listing PDF.',
  },
  {
    icon: Truck,
    title: 'Coordinating the move itself',
    body: 'Recommendations for movers, help timing your closing around your move date, and a realistic plan for the weeks on either side of it.',
  },
  {
    icon: FileSignature,
    title: 'Remote & mail-away closings',
    body: 'Can’t be in Florida for closing day? I’ll set up remote signing so the deal closes on schedule either way.',
  },
  {
    icon: Users,
    title: 'Extra care when it’s needed',
    body: 'Some moves need more hands-on coordination than others — I’ve helped orchestrate a full relocation for a client in his 80s, with the patience and attention that takes.',
  },
]

export function RelocationSupport() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Moving to Florida is more than a real estate transaction
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          Buying the house is one piece of relocating to Tampa from out of state. I help with the
          rest of it too — here&apos;s what that actually looks like.
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {ITEMS.map((item) => (
            <div key={item.title} className="flex gap-4">
              <item.icon className="h-7 w-7 shrink-0 text-blue-600" strokeWidth={1.75} />
              <div>
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-blue-100 bg-blue-50 p-6">
          <p className="text-sm leading-relaxed text-slate-700">
            <span className="font-semibold text-slate-900">A real example:</span> I recently helped
            coordinate a relocation to Tampa for a couple, including the husband, who is in his
            80s. A move like that isn&apos;t just about finding a house — it&apos;s logistics,
            timing, and patience every step of the way. If you&apos;re moving later in life, or
            helping a parent relocate to Florida, that&apos;s exactly the kind of move I know how to
            handle well.
          </p>
        </div>
      </div>
    </section>
  )
}
