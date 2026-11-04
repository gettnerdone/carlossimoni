import { Palmtree, Laptop, Briefcase, HeartHandshake } from 'lucide-react'

const PERSONAS = [
  {
    icon: Palmtree,
    title: 'Retirees & Snowbirds',
    body:
      'Trading snow for sunshine, full-time or seasonally. I’ll help you weigh active-adult communities against quieter established neighborhoods based on how you actually want to spend your time here.',
  },
  {
    icon: Laptop,
    title: 'Remote Workers',
    body:
      'Not tied to an office means you can actually choose where you live. I’ll help you think through commute-free priorities like internet reliability, walkability, and home office space.',
  },
  {
    icon: Briefcase,
    title: 'Job Relocations',
    body:
      'Moving to the Tampa Bay area for work, often on a tight timeline. I’ll help you move fast without moving blind — a short list of the right areas instead of a frantic week of research.',
  },
  {
    icon: HeartHandshake,
    title: 'Families Relocating a Parent',
    body:
      'Helping a parent or relative move to Florida is often about more than real estate. I’ve coordinated a full relocation for a client in his 80s and understand the extra care and patience that move takes.',
  },
]

export function WhoCarlosHelps() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Who I help move to Florida</h2>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          Relocating to Tampa Bay looks different depending on why you&apos;re moving — here&apos;s
          how I typically help.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {PERSONAS.map((p) => (
            <div key={p.title} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-6">
              <p.icon className="h-8 w-8 shrink-0 text-blue-600" strokeWidth={1.75} />
              <div>
                <h3 className="font-semibold text-slate-900">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
