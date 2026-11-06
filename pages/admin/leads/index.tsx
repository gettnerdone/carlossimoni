import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Loader2, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/cn'
import AdminNav from '@/components/admin/AdminNav'

const STAGES = [
  { value: '', label: 'All' },
  { value: 'not_contacted', label: 'Not contacted' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interested', label: 'Interested' },
  { value: 'appointment_booked', label: 'Appointment' },
  { value: 'listed', label: 'Listed' },
  { value: 'lost', label: 'Lost' },
]

interface LeadRow {
  id: number
  name: string
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  stage: string
  dnc: boolean
  property_price: number | null
  vulcan7_date_added: string | null
  phone_count: number
  email_count: number
}

export default function LeadsList() {
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [signedIn, setSignedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({})
  const [stageFilter, setStageFilter] = useState('')

  async function load() {
    setLoading(true)
    try {
      const url = stageFilter ? `/api/admin/leads?stage=${stageFilter}` : '/api/admin/leads'
      const res = await fetch(url)
      if (res.status === 401) {
        setSignedIn(false)
        return
      }
      setSignedIn(true)
      const data = await res.json()
      setLeads(data.leads || [])
      setStageCounts(data.stageCounts || {})
    } finally {
      setLoading(false)
      setCheckingAuth(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageFilter])

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

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <AdminNav />

        <h1 className="text-xl font-semibold text-slate-900">Leads</h1>

        <div className="flex flex-wrap gap-2">
          {STAGES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStageFilter(s.value)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                stageFilter === s.value
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
              )}
            >
              {s.label}
              {s.value && stageCounts[s.value] ? ` (${stageCounts[s.value]})` : ''}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          )}
          {!loading && leads.length === 0 && <p className="p-8 text-center text-sm text-slate-400">No leads.</p>}
          {!loading && leads.length > 0 && (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">City</th>
                  <th className="px-4 py-2.5">Stage</th>
                  <th className="px-4 py-2.5">Phones</th>
                  <th className="px-4 py-2.5">Emails</th>
                  <th className="px-4 py-2.5">Price</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-medium text-slate-900">
                      <Link href={`/admin/leads/${lead.id}`} className="hover:underline">
                        {lead.name}
                      </Link>
                      {lead.dnc && (
                        <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                          DNC
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {lead.city ? `${lead.city}, ${lead.state}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{lead.stage.replaceAll('_', ' ')}</td>
                    <td className="px-4 py-2.5 text-slate-600">{lead.phone_count}</td>
                    <td className="px-4 py-2.5 text-slate-600">{lead.email_count}</td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {lead.property_price ? `$${Number(lead.property_price).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link href={`/admin/leads/${lead.id}`} className="text-xs font-semibold text-blue-600 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
