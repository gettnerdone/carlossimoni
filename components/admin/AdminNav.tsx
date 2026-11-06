import Link from 'next/link'
import { useRouter } from 'next/router'
import { CalendarCheck, Users, Settings } from 'lucide-react'
import { cn } from '@/lib/cn'

const TABS = [
  { href: '/admin/today', label: 'Today', icon: CalendarCheck },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/vulcan7', label: 'Sync', icon: Settings },
]

export default function AdminNav() {
  const router = useRouter()

  return (
    <nav className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
      {TABS.map((tab) => {
        const active = router.pathname === tab.href || router.pathname.startsWith(tab.href + '/')
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
              active ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
