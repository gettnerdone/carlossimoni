import { Photo } from './Photo'
import { PHOTOS } from '@/content/photos'

const NEIGHBORHOODS: { photoId: keyof typeof PHOTOS; name: string; blurb: string }[] = [
  {
    photoId: 'neighborhoodSouthTampa',
    name: 'South Tampa',
    blurb: 'Walkable, close to downtown and the airport, older housing stock, highest price point.',
  },
  {
    photoId: 'neighborhoodWestchase',
    name: 'Westchase',
    blurb: 'Master-planned community, strong schools, golf course, family-oriented.',
  },
  {
    photoId: 'neighborhoodNewTampaWesleyChapel',
    name: 'New Tampa & Wesley Chapel',
    blurb: 'New construction, more house for the money, growing fast, good commute to I-75.',
  },
  {
    photoId: 'neighborhoodCarrollwood',
    name: 'Carrollwood',
    blurb: 'Established, tree-lined, lake-front options, central to everything.',
  },
  {
    photoId: 'neighborhoodStPeteClearwater',
    name: 'St. Petersburg & Clearwater',
    blurb: 'Beach access, walkable downtowns, a different pace on the Pinellas side of the bay.',
  },
  {
    photoId: 'neighborhoodBrandonRiverview',
    name: 'Brandon & Riverview',
    blurb: 'Value-focused suburbs east of Tampa, newer subdivisions, shorter commute to Tampa than it looks.',
  },
  {
    photoId: 'neighborhoodSarasotaNorthPort',
    name: 'Sarasota & North Port',
    blurb: 'South of Tampa, a laid-back beach-town pace and top-rated beaches — a longer drive if you need Tampa daily.',
  },
  {
    photoId: 'neighborhoodSpringHill',
    name: 'Spring Hill',
    blurb: 'North of Tampa in Hernando County, one of the most budget-friendly options in the area, popular with retirees and first-time buyers.',
  },
  {
    photoId: 'neighborhoodLakeland',
    name: 'Lakeland',
    blurb: 'Halfway between Tampa and Orlando, a real downtown of its own, noticeably lower cost of living — a great fit if you’re not tied to a daily Tampa commute.',
  },
  {
    photoId: 'neighborhoodPlantCity',
    name: 'Plant City',
    blurb: 'Small-town main street feel just east of Tampa, among the most affordable options on this list, still a workable commute.',
  },
  {
    photoId: 'neighborhoodLakewoodRanch',
    name: 'Lakewood Ranch',
    blurb: 'One of the top-selling master-planned communities in the country — polished amenities, strong schools, south of Tampa near Sarasota.',
  },
  {
    photoId: 'neighborhoodFishHawkValrico',
    name: 'FishHawk Ranch & Valrico',
    blurb: 'Family-focused planned communities with top-rated schools, east of Tampa — a strong fit if schools are the top priority.',
  },
]

export function NeighborhoodGrid() {
  return (
    <section id="neighborhoods" className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tampa Bay neighborhoods, at a glance</h2>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          Every out-of-state move is different — tell me what you&apos;re prioritizing (commute, schools,
          budget, flood risk) and I&apos;ll point you toward the right area, not just the popular one.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {NEIGHBORHOODS.map((n) => (
            <div
              key={n.name}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/60"
            >
              <div className="overflow-hidden">
                <Photo id={n.photoId} className="h-44 w-full transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-slate-900">{n.name}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{n.blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
