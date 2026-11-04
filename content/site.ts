// Single source of truth for every NAP (Name/Address/Phone) and contact
// detail on the site. Google and other local-search engines weigh
// consistent NAP info heavily for local SEO, so every place this info
// appears (header, footer, schema.org JSON-LD) reads from here instead of
// being retyped.
export const SITE = {
  agentName: 'Carlos Simoni',
  // TODO (legal — Florida real estate advertising rules require the agent's
  // supervising brokerage name, and most states require the license number,
  // to appear on advertising materials): fill these in before launch.
  brokerageName: '', // e.g. "XYZ Realty"
  licenseNumber: '', // Carlos's FL real estate license number

  phoneDisplay: '(813) 468-5086',
  phoneTel: '+18134685086', // E.164 format for tel: links
  email: 'carlos.simoni@cmadraft.com', // TODO: switch to a carlossimoni.com address once the domain's email is set up

  areaServed: 'Tampa Bay, FL',
  domain: 'carlossimoni.com',
  siteUrl: 'https://carlossimoni.com', // update if a different domain is used

  // Leave blank until real accounts exist — components hide any link whose
  // value is empty, so nothing links out to a profile that doesn't exist yet.
  social: {
    instagram: '',
    facebook: '',
    youtube: '',
    tiktok: '',
    linkedin: '',
  },
} as const
