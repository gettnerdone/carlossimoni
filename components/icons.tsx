// Lucide dropped brand/logo icons a while back (trademark reasons), so the
// handful of social icons used in the footer are small hand-rolled SVGs
// instead, kept minimal/outline to match lucide's visual style.
import type { SVGProps } from 'react'

function base(props: SVGProps<SVGSVGElement>) {
  return { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, ...props }
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h2.5l.5-4H13V7a1 1 0 0 1 1-1h2z" />
    </svg>
  )
}

export function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9.5v5l5-2.5z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="2" y="2" width="20" height="20" rx="3" />
      <circle cx="7" cy="8" r="1.1" fill="currentColor" stroke="none" />
      <path d="M7 11v7M12 11v7M12 14c0-2 1.5-3 3-3s2.5 1.2 2.5 3v4" />
    </svg>
  )
}
