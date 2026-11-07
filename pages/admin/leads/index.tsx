import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Loader2, ShieldAlert, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
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

const COLUMNS: { key: string; label: string; sortable: boolean }[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'city', label: 'City', sortable: true },
  { key: 'stage', label: 'Stage', sortable: true },
  { key: 'phones', label: 'Phones', sortable: false },
  { key: 'emails', label: 'Emails', sortable: false },
  { key: 'price', label: 'Price', sortable: true },
  { key: 'date_added', label: 'Date added', sortable: true },
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
  const [total, setTotal] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({})
  const [stageFilter, setStageFilter] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortKey, setSortKey] = useState('date_added')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [offset, setOffset] = useState(0)

  // Debounce the search box so every keystroke doesn't fire a request.
  // Resetting the page here (rather than in a separate effect watching
  // debouncedSearch) keeps the state change and the page reset in the same
  // update, so the list effect below never fires once with a stale offset
  // and once corrected.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setOffset(0)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  function selectStage(value: string) {
    setStageFilter(value)
    setOffset(0)
  }

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (stageFilter) params.set('stage', stageFilter)
      if (debouncedSearch) params.set('q', debouncedSearch)
      params.set('sort', sortKey)
      params.set('dir', sortDir)
      params.set('offset', String(offset))

      const res = await fetch(`/api/admin/leads?${params.toString()}`)
      if (res.status === 401) {
        setSignedIn(false)
        return
      }
      setSignedIn(true)
      const data = await res.json()
      setLeads(data.leads || [])
      setStageCounts(data.stageCounts || {})
      setTotal(data.total ?? 0)
      setPageSize(data.pageSize ?? 50)
    } finally {
      setLoading(false)
      setCheckingAuth(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageFilter, debouncedSearch, sortKey, sortDir, offset])

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setOffset(0)
  }

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

  const page = Math.floor(offset / pageSize) + 1
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const rangeStart = total === 0 ? 0 : offset + 1
  const rangeEnd = Math.min(offset + pageSize, total)

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <AdminNav />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-slate-900">Leads</h1>
          <div className="relative w-full max-w-xs sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, city, phone, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {STAGES.map((s) => (
            <button
              key={s.value}
              onClick={() => selectStage(s.value)}
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
          {!loading && leads.length === 0 && (
            <p className="p-8 text-center text-sm text-slate-400">
              {search ? `No leads match "${search}".` : 'No leads.'}
            </p>
          )}
          {!loading && leads.length > 0 && (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="px-4 py-2.5">
                      {col.sortable ? (
                        <button
                          onClick={() => toggleSort(col.key)}
                          className="flex items-center gap-1 hover:text-slate-700"
                        >
                          {col.label}
                          {sortKey === col.key &&
                            (sortDir === 'asc' ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ))}
                        </button>
                      ) : (
                        col.label
                      )}
                    </th>
                  ))}
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
                    <td className="px-4 py-2.5 whitespace-nowrap text-slate-500">
                      {lead.vulcan7_date_added
                        ? new Date(lead.vulcan7_date_added).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
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

          {!loading && total > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
              <span>
                {rangeStart}–{rangeEnd} of {total}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOffset((o) => Math.max(0, o - pageSize))}
                  disabled={offset === 0}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </button>
                <span className="px-1">
                  Page {page} of {pageCount}
                </span>
                <button
                  onClick={() => setOffset((o) => (o + pageSize < total ? o + pageSize : o))}
                  disabled={offset + pageSize >= total}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
