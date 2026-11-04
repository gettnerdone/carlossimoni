export const FAQ_ITEMS = [
  {
    question: 'Do I need to visit Tampa in person before buying?',
    answer:
      "No — a lot of my out-of-state clients do most of their research and even their first few tours remotely. I'll do video walkthroughs and give you honest, specific feedback on properties, not just a sales pitch — pointing out the things a photo listing won't show you, like street noise, how a flood zone line actually cuts through a block, or what the neighbors' yards look like. Most people do come for at least one in-person trip before closing, usually to walk the final one or two homes and sign paperwork, but it's not a requirement to get started, and plenty of my clients write their first offer before ever setting foot in Florida.",
  },
  {
    question: "What's the best way to learn about Tampa neighborhoods from out of state?",
    answer:
      "Start with a call. Tell me your budget, commute needs, and priorities (schools, flood risk, walkability, commute to the airport, whatever matters to you) and I'll narrow a huge list of neighborhoods down to a handful that actually fit — instead of you trying to research all of Tampa Bay from scratch off of forums and outdated blog posts. Tampa Bay isn't one market, it's a dozen very different ones stitched together, and the right answer for a retiree is usually the wrong answer for a family with school-age kids.",
  },
  {
    question: 'Is Tampa a good place to relocate to?',
    answer:
      "It depends entirely on what you're looking for — that's exactly the kind of question I help people answer honestly rather than just saying yes to close a deal. Happy to talk through the real tradeoffs (cost of living, insurance, climate, job market, how far you are from a major airport if you travel for work or to see family) for your specific situation. Some people move here and love it immediately; others find the heat, the insurance costs, or the pace aren't what they expected. I'd rather you find that out on a phone call with me than six months after closing.",
  },
  {
    question: 'Does Carlos only work with buyers moving from out of state?',
    answer:
      "That's my specialty and where most of my experience is focused — I've built my whole process around the specific challenges of buying somewhere you can't easily drive to — but I work with local buyers and sellers too. If you're already in Tampa Bay and just ready to buy or sell, reach out either way; the process is simpler without the long-distance logistics, but you get the same level of attention.",
  },
  {
    question: 'Is there a cost to work with me?',
    answer:
      "Working with me as your buyer's agent doesn't come out of your pocket in most cases — in a typical Florida transaction, the seller covers the buyer's agent commission as part of the deal. I'll explain exactly how compensation works for your specific situation before we start working together, with no surprises and nothing you're signing without understanding first.",
  },
  {
    question: 'How do I move to Florida from out of state?',
    answer:
      "Start by narrowing down where in Florida actually fits you — Tampa Bay is a big area with very different neighborhoods, price points, and flood risk block to block, and 'Florida' as a whole spans wildly different markets from Miami to the Panhandle. From there it's really three threads running at once: finding the right home, handling the logistics of the physical move itself (movers, timing, your old home's sale or lease), and timing all of it together so you're not paying for two places or living out of boxes longer than you have to. I help with all three, not just the home-buying part — that's usually where out-of-state buyers get overwhelmed, trying to manage it all themselves from a thousand miles away.",
  },
  {
    question: 'Does Carlos help with the actual move, not just buying the house?',
    answer:
      "Yes — finding the house is half of it. I also help coordinate the logistics around it: recommending movers, timing a closing around your move date, setting up remote or mail-away closings if you can't be here in person, and generally making sure nothing falls through the cracks between 'offer accepted' and 'keys in hand.' For some clients that's meant being at the house on move-in day. I'd rather be genuinely useful than just hand you keys and disappear.",
  },
  {
    question: 'Can you help elderly parents or retirees relocate to Florida?',
    answer:
      "Yes — this is something I've done hands-on, not just something I offer on paper. I recently helped coordinate a full relocation for a couple moving to Tampa, including the husband, who is in his 80s — working through the logistics with the extra care and patience that kind of move needs, down to being there to help carry boxes on move-in day. If you're helping a parent relocate, or relocating yourself later in life, I understand it's often about more than the real estate: it's downsizing decisions, timing around family schedules, and making sure the person moving actually feels settled, not just signed-for.",
  },
  {
    question: 'What does it cost to live in Tampa compared to where I am now?',
    answer:
      "It depends heavily on where you're coming from and what you're comparing — Florida's lack of state income tax helps, but insurance and some other costs can offset that depending on the property, and utility and insurance costs vary a lot by neighborhood and flood zone within Tampa Bay itself. Rather than quote you a generic cost-of-living number that doesn't account for any of that, I'll walk through the real comparison for your specific situation — your income, your target price range, and the specific areas you're considering — so you're making the decision with real numbers instead of a national-average statistic.",
  },
  {
    question: 'Is now a good time to move to Florida?',
    answer:
      "There's rarely a single right answer to that — it depends more on your own timeline (job start date, when your current home sells, a lease ending) than on trying to time the market perfectly, and anyone who tells you they can call the exact bottom of a market is guessing. What I can tell you honestly is what inventory and pricing look like right now in the specific areas you're considering, how long homes are sitting, and whether it currently favors buyers or sellers — so you can make that call with real, current information instead of a guess based on a headline you read somewhere.",
  },
  {
    question: 'Do I need a local real estate agent if I already have one back home?',
    answer:
      "Yes — Florida real estate has its own rules, paperwork, and local quirks (flood zones, CDD fees, hurricane-related inspections, Florida-specific disclosure forms) that an out-of-state agent typically won't know well, simply because they don't work in this market day to day. Most agents outside Florida will refer you to a local agent here anyway, since they can't legally represent you on a Florida transaction in most cases. I work with referring agents regularly and keep them in the loop if you'd like — it doesn't have to mean starting over with someone new on your end.",
  },
  {
    question: 'What about hurricane season and insurance when buying in Florida?',
    answer:
      "It's a real factor, not something to brush past or downplay. Every property I show out-of-state buyers gets a look at its flood zone and realistic insurance range before we go further, not as a surprise at closing — insurance costs can swing a property's true monthly cost significantly, and I'd rather you know that up front than fall in love with a house you can't actually afford to insure. Hurricane season (June through November) doesn't mean you can't close during it — it just means timing and insurance binding windows need a little more attention, since some insurers won't bind new policies once a storm is actively approaching. I handle that timing as part of the process so it doesn't catch you off guard.",
  },
  {
    question: 'How do property taxes work for someone new to Florida?',
    answer:
      "Florida has a homestead exemption that can meaningfully lower property taxes on a primary residence once you establish residency, plus a cap (Save Our Homes) on how much your assessed value can increase each year after that, which protects long-term owners from sudden tax jumps. The specifics depend on the county, the property's assessed value, and your residency status, so I'll point you to exact numbers for a property you're considering rather than a generic percentage that may not apply to your situation — and I'd recommend a local tax professional or the county property appraiser's office for anything beyond the real estate side, like exemption deadlines or how it interacts with taxes in your current state.",
  },
] as const

export function FAQSection() {
  return (
    <section id="faq" className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Frequently asked questions</h2>

        <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group py-5 transition-colors duration-200 hover:bg-slate-50 rounded-lg px-2 -mx-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                {item.question}
                <span className="shrink-0 text-xl text-blue-600 transition-transform duration-200 group-open:rotate-45 group-hover:scale-110">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
