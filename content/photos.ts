// Every photo the site needs, in one place. Each slot renders a labeled
// placeholder (see components/Photo.tsx) until `src` is filled in — so
// dropping in real photos later is just: add the file under /public/images/
// and set `src` here. No hunting through component files.
//
// `width`/`height` are the aspect ratio the layout is built around — doesn't
// need to be the exact pixel size of the source photo, just the same ratio.
export interface PhotoSlot {
  src: string | null
  alt: string
  width: number
  height: number
  brief: string
}

export const PHOTOS: Record<string, PhotoSlot> = {
  heroBackground: {
    src: null,
    alt: 'Tampa Bay skyline or waterfront, the site’s hero background',
    width: 1920,
    height: 1080,
    brief:
      'Big, wide, landscape shot that fills the full-width hero banner behind the headline and sign-up form — a recognizable Tampa Bay scene (downtown skyline, Bayshore Blvd, a palm-lined waterfront). Needs to stay legible under a dark overlay with white text on top, so avoid a busy, high-contrast center; a wide-angle shot with open sky or water toward the upper-left reads best. Can include Carlos in frame, but doesn’t have to.',
  },
  ogShare: {
    src: '/og-image.jpg',
    alt: 'Carlos Simoni — Tampa relocation specialist',
    width: 1200,
    height: 630,
    brief:
      'Landscape image used when the site link is shared on social/text/iMessage. Can reuse the hero photo cropped wide, or a Tampa skyline shot with Carlos in frame.',
  },
  neighborhoodSouthTampa: {
    src: '/images/south-tampa.webp',
    alt: 'South Tampa neighborhood street',
    width: 800,
    height: 600,
    brief: 'A recognizable South Tampa street or Bayshore Blvd shot.',
  },
  neighborhoodWestchase: {
    src: '/images/westchase.webp',
    alt: 'Westchase neighborhood',
    width: 800,
    height: 600,
    brief: 'Westchase community entrance, a park, or a typical street.',
  },
  neighborhoodNewTampaWesleyChapel: {
    src: '/images/wesley-chapel.webp',
    alt: 'New Tampa / Wesley Chapel new construction neighborhood',
    width: 800,
    height: 600,
    brief: 'A newer-build community — New Tampa or Wesley Chapel.',
  },
  neighborhoodCarrollwood: {
    src: '/images/carrollwood.webp',
    alt: 'Carrollwood neighborhood',
    width: 800,
    height: 600,
    brief: 'Carrollwood area — lakes, established tree-lined streets.',
  },
  neighborhoodStPeteClearwater: {
    src: '/images/st-pete-clearwater.webp',
    alt: 'St. Petersburg / Clearwater beach area',
    width: 800,
    height: 600,
    brief: 'A beach or downtown St. Pete shot for the Pinellas-side audience.',
  },
  neighborhoodBrandonRiverview: {
    src: '/images/brandon-riverview.webp',
    alt: 'Brandon / Riverview suburban neighborhood',
    width: 800,
    height: 600,
    brief: 'A Brandon/Riverview family-suburb street or community amenity.',
  },
  neighborhoodSarasotaNorthPort: {
    src: '/images/sarasota-north-port.webp',
    alt: 'Sarasota / North Port area',
    width: 800,
    height: 600,
    brief: 'Downtown Sarasota or a North Port street — a laid-back, beach-town feel south of Tampa.',
  },
  neighborhoodSpringHill: {
    src: '/images/spring-hill.webp',
    alt: 'Spring Hill neighborhood',
    width: 800,
    height: 600,
    brief: 'A typical Spring Hill (Hernando County) street — budget-friendly, north of Tampa.',
  },
  neighborhoodLakeland: {
    src: '/images/lakeland.webp',
    alt: 'Lakeland, Florida',
    width: 800,
    height: 600,
    brief: 'Downtown Lakeland — the lakefront (Lake Mirror / Lake Morton) is the iconic shot.',
  },
  neighborhoodPlantCity: {
    src: '/images/plant-city.webp',
    alt: 'Plant City, Florida',
    width: 800,
    height: 600,
    brief: 'Downtown Plant City — small-town main street feel, strawberry-farming heritage.',
  },
  neighborhoodLakewoodRanch: {
    src: '/images/lakewood-ranch.webp',
    alt: 'Lakewood Ranch master-planned community',
    width: 800,
    height: 600,
    brief: 'A Lakewood Ranch community entrance, Main Street, or lake/park amenity — polished, master-planned feel.',
  },
  neighborhoodFishHawkValrico: {
    src: '/images/fishhawk-valrico.webp',
    alt: 'FishHawk Ranch / Valrico neighborhood',
    width: 800,
    height: 600,
    brief: 'A FishHawk Ranch or Valrico street — family-suburb, top-rated-schools feel.',
  },
  processCall: {
    src: null,
    alt: 'Carlos on a video call with an out-of-state client',
    width: 700,
    height: 500,
    brief: 'Carlos on his phone/laptop — represents the first "call or fill out the form" step. Can be a staged, candid-style shot.',
  },
}
