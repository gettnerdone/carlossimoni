import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  Loader2,
  ArrowLeft,
  Phone,
  Mail,
  Home,
  Ban,
  MailX,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarClock,
  PhoneCall,
  PhoneIncoming,
  MapPin,
  StickyNote,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import AdminNav from '@/components/admin/AdminNav'
import { STAGE_META, type Stage } from '@/lib/crm-stages'
import {
  ACTIVITY_TYPES,
  ACTIVITY_LABELS,
  OUTCOMES,
  OUTCOME_LABELS,
  NEXT_ACTION_LABELS,
  OUTCOMES_WITHOUT_NEXT_ACTION,
  suggestNextAction,
  isCallType,
  nextCallAllowedAt,
  type ActivityType,
  type Outcome,
  type NextActionKind,
} from '@/lib/crm-activity'

interface Lead {
  id: number
  name: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  property_price: number | null
  property_type: string | null
  stage: Stage
  dnc: boolean
  dnc_reason: string | null
  email_opt_out: boolean
  last_call_at: string | null
}
interface PhoneRow {
  phone: string
  label: string | null
  is_primary: boolean
  is_dnc: boolean
}
interface EmailRow {
  email: string
  is_primary: boolean
}
interface Activity {
  id: number
  type: string
  outcome: string | null
  engaged: boolean | null
  body: string | null
  from_stage: string | null
  to_stage: string | null
  created_at: string
}
interface Task {
  id: number
  action: NextActionKind
  due_at: string
  note: string | null
}

const TYPE_ICON: Record<string, typeof PhoneCall> = {
  call: PhoneCall,
  inbound_call: PhoneIncoming,
  email_sent: Mail,
  email_received: Mail,
  visit: MapPin,
  note: StickyNote,
  stage_change: Sparkles,
}

function daysFromNowAt10(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(10, 0, 0, 0)
  return d
}
function fmt(d: Date) {
  return d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}
function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function LeadDetail() {
  const router = useRouter()
  const { id } = router.query
  const leadId = typeof id === 'string' ? id : null

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [lead, setLead] = useState<Lead | null>(null)
  const [phones, setPhones] = useState<PhoneRow[]>([])
  const [emails, setEmails] = useState<EmailRow[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [task, setTask] = useState<Task | null>(null)

  const [type, setType] = useState<ActivityType>('call')
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [body, setBody] = useState('')
  const [nextKind, setNextKind] = useState<NextActionKind>('call')
  const [nextWhen, setNextWhen] = useState<Date>(daysFromNowAt10(2))
  const [nextNote, setNextNote] = useState('')
  const [skipNext, setSkipNext] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rescheduling, setRescheduling] = useState(false)
  const [rescheduleWhen, setRescheduleWhen] = useState<Date>(new Date())

  async function load() {
    if (!leadId) return
    setLoading(true)
    try {
      const [leadRes, actRes] = await Promise.all([
        fetch(`/api/admin/leads/${leadId}`),
        fetch(`/api/admin/leads/${leadId}/activities`),
      ])
      if (leadRes.status === 404) {
        setNotFound(true)
        return
      }
      const leadData = await leadRes.json()
      const actData = await actRes.json()
      setLead(leadData.lead)
      setPhones(leadData.phones || [])
      setEmails(leadData.emails || [])
      setActivities(actData.activities || [])
      setTask(actData.nextAction || null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId])

  useEffect(() => {
    const s = suggestNextAction(type, outcome)
    if (s) {
      setNextKind(s.action)
      setNextWhen(daysFromNowAt10(s.days))
      setSkipNext(false)
    } else {
      setSkipNext(true)
    }
  }, [type, outcome])

  const closed = lead?.stage === 'listed' || lead?.stage === 'lost'
  const nextOptional = type === 'note' || closed || (outcome != null && OUTCOMES_WITHOUT_NEXT_ACTION.includes(outcome))
  const showNext = outcome !== 'do_not_call'
  const callBlockedUntil = nextCallAllowedAt(lead?.last_call_at)

  async function save() {
    if (!leadId) return
    setError(null)
    if (isCallType(type) && !outcome) {
      setError('Pick how the call went.')
      return
    }
    if (type === 'note' && !body.trim()) {
      setError('Write the note first.')
      return
    }
    const wantNext = showNext && !skipNext
    if (!nextOptional && !wantNext) {
      setError('Set the NEXT ACTION (what and when).')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          outcome: isCallType(type) ? outcome : null,
          body: body.trim() || null,
          nextAction: wantNext ? { action: nextKind, dueAt: nextWhen.toISOString(), note: nextNote.trim() || null } : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not save')
        return
      }
      setBody('')
      setNextNote('')
      setOutcome(null)
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function completeTask() {
    if (!task) return
    await fetch(`/api/admin/tasks/${task.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ done: true }) })
    await load()
  }
  async function reschedule() {
    if (!task) return
    await fetch(`/api/admin/tasks/${task.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dueAt: rescheduleWhen.toISOString() }) })
    setRescheduling(false)
    await load()
  }
  async function setFlag(patch: { dnc?: boolean; email_opt_out?: boolean }) {
    if (!leadId) return
    await fetch(`/api/admin/leads/${leadId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
    await load()
  }

  if (loading && !lead) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    )
  }

  if (notFound || !lead) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-500">Lead not found.</p>
      </div>
    )
  }

  const meta = STAGE_META[lead.stage]
  const StageIcon = meta.icon

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-5">
        <AdminNav />

        <Link href="/admin/leads" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to leads
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{lead.name}</h1>
              {lead.address && (
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                  <Home className="h-3.5 w-3.5" />
                  {lead.address}, {lead.city}, {lead.state} {lead.zip}
                </p>
              )}
              {lead.property_price != null && (
                <p className="mt-1 text-sm text-slate-500">
                  ${Number(lead.property_price).toLocaleString()} — {lead.property_type || 'Unknown type'}
                </p>
              )}
            </div>
            <span className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', meta.text, 'bg-slate-100')}>
              <StageIcon className="h-3.5 w-3.5" />
              {meta.label}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Phone className="h-3.5 w-3.5" />
                Phones ({phones.length})
              </h3>
              <ul className="mt-2 space-y-1">
                {phones.length === 0 && <li className="text-sm text-slate-400">None</li>}
                {phones.map((p) => (
                  <li key={p.phone} className="flex items-center gap-2 text-sm text-slate-700">
                    <a href={`tel:${p.phone}`} className="hover:underline">
                      {p.phone}
                    </a>
                    {p.label && <span className="text-xs text-slate-400">({p.label})</span>}
                    {p.is_dnc && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">DNC</span>}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Mail className="h-3.5 w-3.5" />
                Emails ({emails.length})
              </h3>
              <ul className="mt-2 space-y-1">
                {emails.length === 0 && <li className="text-sm text-slate-400">None</li>}
                {emails.map((e) => (
                  <li key={e.email} className="text-sm text-slate-700">
                    <a href={`mailto:${e.email}`} className="hover:underline">
                      {e.email}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {lead.dnc && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <Ban className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Do not call</p>
              <p className="text-xs">
                {lead.dnc_reason === 'asked' ? 'They asked not to be called.' : lead.dnc_reason ? `Reason: ${lead.dnc_reason}` : ''} No calls.
              </p>
            </div>
            <button onClick={() => setFlag({ dnc: false })} className="cursor-pointer text-xs underline">
              Undo
            </button>
          </div>
        )}
        {!lead.dnc && callBlockedUntil && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>
              Called in the last 24 hours. Next call allowed after <span className="font-semibold">{fmt(callBlockedUntil)}</span>.
            </p>
          </div>
        )}
        {lead.email_opt_out && (
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
            <MailX className="h-3.5 w-3.5" />
            Opted out of email — don&apos;t email them.
            <button onClick={() => setFlag({ email_opt_out: false })} className="ml-auto cursor-pointer underline">
              Undo
            </button>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <CalendarClock className="h-3.5 w-3.5" />
            Next action
          </p>
          {task ? (
            <div
              className={cn(
                'rounded-lg border px-3 py-2.5 text-sm',
                new Date(task.due_at).getTime() < Date.now() ? 'border-red-200 bg-red-50/60' : 'border-slate-200',
              )}
            >
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">
                    {NEXT_ACTION_LABELS[task.action]} · {fmt(new Date(task.due_at))}
                    {new Date(task.due_at).getTime() < Date.now() && <span className="ml-1 text-xs font-semibold text-red-600">overdue</span>}
                  </p>
                  {task.note && <p className="mt-0.5 whitespace-pre-wrap text-xs text-slate-500">{task.note}</p>}
                </div>
              </div>
              {rescheduling ? (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="datetime-local"
                    value={toLocalInputValue(rescheduleWhen)}
                    onChange={(e) => setRescheduleWhen(new Date(e.target.value))}
                    className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  />
                  <button onClick={reschedule} className="cursor-pointer rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs text-white">
                    Save
                  </button>
                  <button onClick={() => setRescheduling(false)} className="cursor-pointer rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <button onClick={completeTask} className="inline-flex cursor-pointer items-center gap-1 text-green-700 hover:underline">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark done
                  </button>
                  <button
                    onClick={() => {
                      setRescheduleWhen(new Date(task.due_at))
                      setRescheduling(true)
                    }}
                    className="cursor-pointer text-blue-600 hover:underline"
                  >
                    Reschedule
                  </button>
                  <span className="text-slate-400">Logging below also closes it.</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm italic text-slate-400">None set.</p>
          )}
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Log what happened</p>
          <div className="flex flex-wrap gap-1.5">
            {ACTIVITY_TYPES.map((t) => (
              <button
                key={t.type}
                onClick={() => {
                  setType(t.type)
                  setOutcome(null)
                }}
                className={cn(
                  'cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs transition-colors',
                  type === t.type ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {isCallType(type) && (
            <div>
              <p className="mb-1.5 text-xs text-slate-500">How did it go?</p>
              <div className="grid grid-cols-2 gap-1.5">
                {OUTCOMES.map((o) => (
                  <button
                    key={o.outcome}
                    onClick={() => setOutcome(o.outcome)}
                    className={cn(
                      'cursor-pointer rounded-lg border px-2.5 py-2 text-left text-xs transition-colors',
                      outcome === o.outcome
                        ? o.outcome === 'do_not_call'
                          ? 'border-red-600 bg-red-600 text-white'
                          : o.engaged
                            ? 'border-green-600 bg-green-600 text-white'
                            : 'border-slate-700 bg-slate-700 text-white'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50',
                    )}
                  >
                    {o.label}
                    <span className={cn('mt-0.5 block text-[10px]', outcome === o.outcome ? 'text-white/80' : 'text-slate-400')}>
                      {o.engaged ? 'Engaged' : 'Not engaged'}
                    </span>
                  </button>
                ))}
              </div>
              {outcome === 'do_not_call' && (
                <p className="mt-2 text-xs text-red-600">
                  They&apos;ll be marked do-not-call: no more calls or emails. Their open next action is closed.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              {type === 'note' ? 'Note (required)' : 'Notes (optional)'}
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={2}
              placeholder={type === 'note' ? 'Write the note…' : 'What was said, who you spoke to…'}
              className="w-full resize-none rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {showNext && (
            <div className="space-y-2 rounded-lg border border-blue-100 bg-blue-50/60 p-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">
                  Next action{nextOptional ? ' (optional)' : ''}
                </p>
                {nextOptional && (
                  <label className="inline-flex items-center gap-1 text-xs text-slate-600">
                    <input type="checkbox" checked={!skipNext} onChange={(e) => setSkipNext(!e.target.checked)} /> Set one
                  </label>
                )}
              </div>
              {(!nextOptional || !skipNext) && (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(NEXT_ACTION_LABELS) as NextActionKind[]).map((k) => (
                      <button
                        key={k}
                        onClick={() => setNextKind(k)}
                        className={cn(
                          'cursor-pointer rounded-lg border bg-white px-2.5 py-1 text-xs',
                          nextKind === k ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-600',
                        )}
                      >
                        {NEXT_ACTION_LABELS[k]}
                      </button>
                    ))}
                  </div>
                  <input
                    type="datetime-local"
                    value={toLocalInputValue(nextWhen)}
                    onChange={(e) => setNextWhen(new Date(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
                  />
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-blue-800/70">What to do (optional)</label>
                    <input
                      value={nextNote}
                      onChange={(e) => setNextNote(e.target.value)}
                      placeholder="e.g. 'Ask about the garage conversion'"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            onClick={save}
            disabled={saving}
            className="w-full cursor-pointer rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>

          <div className="flex items-center gap-3 pt-1 text-xs">
            {!lead.dnc && (
              <button onClick={() => setFlag({ dnc: true })} className="inline-flex cursor-pointer items-center gap-1 text-red-600 hover:underline">
                <Ban className="h-3.5 w-3.5" /> Mark do not call
              </button>
            )}
            {!lead.email_opt_out && (
              <button
                onClick={() => setFlag({ email_opt_out: true })}
                className="inline-flex cursor-pointer items-center gap-1 text-slate-600 hover:underline"
              >
                <MailX className="h-3.5 w-3.5" /> They opted out of email
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">History</p>
          {activities.length === 0 ? (
            <p className="text-sm text-slate-400">Nothing logged yet.</p>
          ) : (
            <div className="space-y-3">
              {activities.map((a) => {
                const Icon = TYPE_ICON[a.type] || StickyNote
                return (
                  <div key={a.id} className="flex gap-2.5">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                      <Icon className="h-3 w-3 text-slate-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      {a.type === 'stage_change' ? (
                        <p className="text-sm text-slate-700">
                          Moved <span className="font-medium">{STAGE_META[a.from_stage as Stage]?.label ?? a.from_stage}</span> →{' '}
                          <span className="font-medium">{STAGE_META[a.to_stage as Stage]?.label ?? a.to_stage}</span>
                        </p>
                      ) : (
                        <>
                          <p className="text-sm text-slate-700">
                            <span className="font-medium">{ACTIVITY_LABELS[a.type] || a.type}</span>
                            {a.outcome && <span> · {OUTCOME_LABELS[a.outcome] || a.outcome}</span>}
                            {a.engaged != null && (
                              <span className={cn('ml-1.5 text-[10px] font-semibold uppercase', a.engaged ? 'text-green-600' : 'text-slate-400')}>
                                {a.engaged ? 'engaged' : 'not engaged'}
                              </span>
                            )}
                          </p>
                          {a.body && <p className="whitespace-pre-wrap text-sm text-slate-600">{a.body}</p>}
                        </>
                      )}
                      <p className="mt-0.5 text-xs text-slate-400">
                        {new Date(a.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
