// Single source of truth for every NAP (Name/Address/Phone) and contact
// detail on the site. Google and other local-search engines weigh
// consistent NAP info heavily for local SEO, so every place this info
// appears (header, footer, schema.org JSON-LD) reads from here instead of
// being retyped.
export const SITE = {
  agentName: 'Carlos Simoni',
  // TODO (legal — Florida real estate advertising rules require the license
  // number to appear on advertising materials): get Carlos's FL license
  // number and fill it in before launch.
  brokerageName: 'Preferred Shore',
  licenseNumber: '', // Carlos's FL real estate license number

  phoneDisplay: '(813) 468-5086',
  phoneTel: '+18134685086', // E.164 format for tel: links
  email: 'carlossimonihomes@gmail.com',

  areaServed: 'Tampa Bay, FL',
  domain: 'carlossimoni.com',
  siteUrl: 'https://carlossimoni.com', // update if a different domain is used

  // Leave blank until real accounts exist — components hide any link whose
  // value is empty, so nothing links out to a profile that doesn't exist yet.
  social: {
    instagram: '',
    facebook: 'https://www.facebook.com/CarlosSimoniRealtor',
    youtube: '',
    tiktok: '',
    linkedin: '',
  },
} as const
