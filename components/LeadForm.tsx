import { useState, type FormEvent } from 'react'
import { Loader2, CheckCircle2, Download } from 'lucide-react'
import { SITE } from '@/content/site'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const TIMELINE_OPTIONS = [
  { value: '', label: 'When are you planning to move?' },
  { value: 'asap', label: 'ASAP / within a few months' },
  { value: '3-6mo', label: '3–6 months out' },
  { value: '6-12mo', label: '6–12 months out' },
  { value: 'researching', label: 'Just researching for now' },
]

export function LeadForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    // Honeypot — real visitors never fill in a field they can't see.
    if (data.get('company')) {
      setStatus('sent')
      return
    }

    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(data)),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || 'Something went wrong.')
      setStatus('sent')
      form.reset()
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-green-600" strokeWidth={1.75} />
        <h3 className="text-lg font-semibold text-slate-900">Got it — thank you!</h3>
        <p className="max-w-sm text-sm text-slate-600">
          Carlos will reach out shortly. If it&apos;s urgent, just call {SITE.phoneDisplay}.
        </p>
        <a
          href="/tampa-relocation-guide.pdf"
          download
          className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Download className="h-4 w-4" strokeWidth={2.5} />
          Download Your Tampa Relocation Guide
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
      {/* Honeypot field, hidden from real users via CSS, not display:none (some bots skip hidden fields). */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="absolute h-0 w-0 overflow-hidden opacity-0"
        aria-hidden="true"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" required />
        <Field label="Email" name="email" type="email" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone (optional)" name="phone" type="tel" />
        <div>
          <label htmlFor="timeline" className="mb-1.5 block text-sm font-medium text-slate-700">
            Timeline
          </label>
          <select
            id="timeline"
            name="timeline"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            {TIMELINE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Field label="Where are you moving from?" name="movingFrom" placeholder="e.g. Chicago, IL" />
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-slate-700">
          Anything else? (optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {status === 'error' && <p className="text-sm font-medium text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
      >
        {status === 'sending' && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === 'sending' ? 'Sending…' : 'Send it to Carlos'}
      </button>
      <p className="text-center text-xs text-slate-500">No cost, no obligation — just a straight answer.</p>
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required,
  placeholder,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
    </div>
  )
}
