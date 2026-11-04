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
    <div className="border-b border-slate-100 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-6 sm:px-6 md:grid-cols-4">
        {ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
            <item.icon className="h-5 w-5 shrink-0 text-blue-600" strokeWidth={2} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
