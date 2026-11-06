import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Loader2, Phone, Mail, MapPin, HelpCircle, ShieldAlert, PhoneCall, Ban, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { NEXT_ACTION_LABELS, type NextActionKind } from '@/lib/crm-activity'
import AdminNav from '@/components/admin/AdminNav'

const ACTION_ICON: Record<string, typeof Phone> = {
  call: PhoneCall,
  email: Mail,
  visit: MapPin,
  other: HelpCircle,
}

interface TodayTask {
  task_id: number
  action: NextActionKind
  due_at: string
  note: string | null
  lead_id: number
  name: string
  phone: string | null
  dnc: boolean
  stage: string
}

export default function Today() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [signedIn, setSignedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState<TodayTask[]>([])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/today')
      if (res.status === 401) {
        setSignedIn(false)
        return
      }
      setSignedIn(true)
      const data = await res.json()
      setTasks(data.tasks || [])
    } finally {
      setLoading(false)
      setCheckingAuth(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!signedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-6 w-6 text-slate-400" />
          <p className="mt-2 text-sm text-slate-600">
            Sign in at{' '}
            <Link href="/admin/vulcan7" className="font-medium text-blue-600 hover:underline">
              /admin/vulcan7
            </Link>{' '}
            first.
          </p>
        </div>
      </div>
    )
  }

  const overdueTasks = tasks.filter((t) => new Date(t.due_at).getTime() < Date.now())
  const todayTasks = tasks.filter((t) => new Date(t.due_at).getTime() >= Date.now())

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <AdminNav />

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Today</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {loading
              ? 'Loading…'
              : tasks.length === 0
                ? "Nothing due — you're caught up."
                : `${tasks.length} to work through${overdueTasks.length ? `, ${overdueTasks.length} overdue` : ''}.`}
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-10">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        )}

        {!loading && tasks.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
            Nothing due. Nice work.
          </div>
        )}

        {!loading && overdueTasks.length > 0 && (
          <TaskGroup title="Overdue" tone="red" tasks={overdueTasks} onOpen={(id) => router.push(`/admin/leads/${id}`)} />
        )}
        {!loading && todayTasks.length > 0 && (
          <TaskGroup title="Due today" tone="blue" tasks={todayTasks} onOpen={(id) => router.push(`/admin/leads/${id}`)} />
        )}
      </div>
    </div>
  )
}

function TaskGroup({
  title,
  tone,
  tasks,
  onOpen,
}: {
  title: string
  tone: 'red' | 'blue'
  tasks: TodayTask[]
  onOpen: (leadId: number) => void
}) {
  return (
    <div className="space-y-2">
      <h2
        className={cn(
          'px-1 text-xs font-bold uppercase tracking-wide',
          tone === 'red' ? 'text-red-600' : 'text-blue-600',
        )}
      >
        {title} ({tasks.length})
      </h2>
      {tasks.map((t) => {
        const Icon = ACTION_ICON[t.action] || HelpCircle
        const overdue = tone === 'red'
        return (
          <div
            key={t.task_id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => onOpen(t.lead_id)}
              className="flex w-full cursor-pointer items-start gap-3 p-4 text-left transition-colors active:bg-slate-50"
            >
              <div
                className={cn(
                  'mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
                  overdue ? 'bg-red-100' : 'bg-blue-100',
                )}
              >
                <Icon className={cn('h-5 w-5', overdue ? 'text-red-600' : 'text-blue-600')} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-base font-semibold text-slate-900">{t.name}</p>
                  {t.dnc && (
                    <span className="flex flex-shrink-0 items-center gap-0.5 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                      <Ban className="h-2.5 w-2.5" />
                      DNC
                    </span>
                  )}
                </div>
                <p className={cn('text-sm', overdue ? 'font-semibold text-red-600' : 'text-slate-500')}>
                  {NEXT_ACTION_LABELS[t.action]} ·{' '}
                  {new Date(t.due_at).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
                {t.note && <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{t.note}</p>}
              </div>
              <ChevronRight className="mt-2 h-4 w-4 flex-shrink-0 text-slate-300" />
            </button>

            {t.phone && (
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-4 py-2.5">
                <span className="text-sm text-slate-500">{t.phone}</span>
                {t.dnc ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                    <Ban className="h-3.5 w-3.5" />
                    Do not call
                  </span>
                ) : (
                  <a
                    href={`tel:${t.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 active:bg-green-800"
                  >
                    <PhoneCall className="h-4 w-4" />
                    Call
                  </a>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
