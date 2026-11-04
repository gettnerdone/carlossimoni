import { BadgeCheck, MapPin, Users, Clock } from 'lucide-react'

// Keep every claim here literally true and checkable — no invented stats
// ("500+ families helped") until they're real. Trust comes from specificity
// that's actually verifiable, not from numbers.
const ITEMS = [
  { icon: BadgeCheck, label: 'Licensed FL Real Estate Agent' },
  { icon: MapPin, label: 'Tampa Bay Area Specialist' },
  { icon: Users, label: 'Works With Out-of-State Buyers' },
  { icon: Clock, label: 'Responds Within 24 Hours' },
]

export function TrustStrip() {
  return (
    <div className="relative border-b border-slate-100 bg-white">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600" />
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-5 px-4 py-7 sm:px-6 md:grid-cols-4 md:gap-x-4 md:divide-x md:divide-slate-100">
        {ITEMS.map((item) => (
          <div
            key={item.label}
            className="group flex items-center gap-3 text-sm font-semibold text-slate-800 md:pl-4 md:first:pl-0"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition-colors group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600">
              <item.icon className="h-5 w-5" strokeWidth={2} />
            </span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
