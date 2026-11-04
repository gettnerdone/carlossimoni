export const FAQ_ITEMS = [
  {
    question: 'Do I need to visit Tampa in person before buying?',
    answer:
      "No — a lot of my out-of-state clients do most of their research and even their first few tours remotely. I'll do video walkthroughs and give you honest, specific feedback on properties, not just a sales pitch. Most people do come for at least one in-person trip before closing, but it's not a requirement to get started.",
  },
  {
    question: "What's the best way to learn about Tampa neighborhoods from out of state?",
    answer:
      "Start with a call. Tell me your budget, commute needs, and priorities (schools, flood risk, walkability, etc.) and I'll narrow a huge list of neighborhoods down to a handful that actually fit — instead of you trying to research all of Tampa Bay from scratch.",
  },
  {
    question: 'Is Tampa a good place to relocate to?',
    answer:
      'It depends entirely on what you’re looking for — that’s exactly the kind of question I help people answer honestly rather than just saying yes to close a deal. Happy to talk through the real tradeoffs (cost of living, insurance, climate, job market) for your specific situation.',
  },
  {
    question: 'Does Carlos only work with buyers moving from out of state?',
    answer:
      'That’s my specialty and where most of my experience is focused, but I work with local buyers and sellers too — reach out either way.',
  },
  {
    question: 'Is there a cost to work with me?',
    answer:
      'Working with me as your buyer’s agent doesn’t come out of your pocket in most cases — I’ll explain exactly how compensation works for your situation before we start, with no surprises.',
  },
] as const

export function FAQSection() {
  return (
    <section id="faq" className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Frequently asked questions</h2>

        <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                {item.question}
                <span className="shrink-0 text-xl text-slate-400 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
