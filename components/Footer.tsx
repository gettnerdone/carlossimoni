import { InstagramIcon, FacebookIcon, YoutubeIcon, LinkedinIcon } from './icons'
import { SITE } from '@/content/site'

const SOCIAL_LINKS = [
  { key: 'instagram', icon: InstagramIcon, label: 'Instagram' },
  { key: 'facebook', icon: FacebookIcon, label: 'Facebook' },
  { key: 'youtube', icon: YoutubeIcon, label: 'YouTube' },
  { key: 'linkedin', icon: LinkedinIcon, label: 'LinkedIn' },
] as const

export function Footer() {
  const activeSocial = SOCIAL_LINKS.filter((s) => SITE.social[s.key])

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-bold text-white">{SITE.agentName}</p>
            <p className="mt-1 text-sm">
              Licensed Real Estate Agent &middot; {SITE.brokerageName} &middot; {SITE.areaServed}
            </p>
            <p className="mt-1 text-sm">
              <a href={`tel:${SITE.phoneTel}`} className="hover:text-white">
                {SITE.phoneDisplay}
              </a>
              {' · '}
              <a href={`mailto:${SITE.email}`} className="hover:text-white">
                {SITE.email}
              </a>
            </p>
            {!SITE.licenseNumber && (
              <p className="mt-2 max-w-sm text-xs text-amber-400">
                TODO before launch: most states require the agent&apos;s license number on real
                estate advertising — add it to content/site.ts.
              </p>
            )}
          </div>

          {activeSocial.length > 0 && (
            <div className="flex gap-4">
              {activeSocial.map((s) => (
                <a
                  key={s.key}
                  href={SITE.social[s.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-slate-400 hover:text-white"
                >
                  <s.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {SITE.agentName}. All rights reserved.</p>
          <a href="/image-credits" className="hover:text-slate-300">
            Image credits
          </a>
        </div>
      </div>
    </footer>
  )
}
