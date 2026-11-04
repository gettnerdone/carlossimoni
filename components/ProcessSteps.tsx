import { Photo } from './Photo'

const STEPS = [
  {
    title: 'Call or fill out the form',
    body: 'Tell me where you’re moving from, your timeline, and what matters most to you in a new area.',
  },
  {
    title: 'Get a personalized area breakdown',
    body: 'Based on your budget, commute, schools, and flood-risk tolerance — not a generic neighborhood list.',
  },
  {
    title: 'Tour virtually or in person',
    body: 'Video walkthroughs when you can’t be here yet, in-person showings when you can.',
  },
  {
    title: 'I handle the rest',
    body: 'Offer, inspection, closing — all long-distance friendly, with you kept in the loop at every step.',
  },
]

export function ProcessSteps() {
  return (
    <section id="how-it-works" className="bg-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">How relocating with Carlos works</h2>
          <ol className="mt-8 space-y-6">
            {STEPS.map((step, i) => (
              <li key={step.title} className="group flex gap-4 rounded-xl p-2 -m-2 transition-colors duration-200 hover:bg-slate-50">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white transition-transform duration-200 group-hover:scale-110">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <Photo id="processCall" className="w-full rounded-2xl" />
      </div>
    </section>
  )
}
