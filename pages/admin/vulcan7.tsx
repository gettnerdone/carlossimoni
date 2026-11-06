import { useState, useEffect, type FormEvent, type ReactNode } from 'react'
import { Eye, EyeOff, Loader2, RefreshCw, Send, Mail, AlertTriangle, History } from 'lucide-react'
import { cn } from '@/lib/cn'
import AdminNav from '@/components/admin/AdminNav'

// One internal page, two actions, built for someone with zero tech skills
// (Carlos) to eventually use directly. Gated by a shared password (see
// lib/admin-auth.ts) since there's no account system yet.

interface PersistedLog {
  id: number
  source: string
  level: 'info' | 'warn' | 'error'
  message: string
  created_at: string
}

export default function Vulcan7Admin() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  // Starts true: we don't know yet whether the existing admin cookie
  // (good for 30 days, see lib/admin-auth.ts) is still valid, so we hold
  // off showing the password form until that check comes back -- otherwise
  // an already-signed-in Carlos sees the login screen flash every time he
  // opens this page.
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [signingIn, setSigningIn] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [busy, setBusy] = useState(false)
  const [busyLabel, setBusyLabel] = useState('')
  const [dryRunResult, setDryRunResult] = useState<any>(null)
  const [history, setHistory] = useState<PersistedLog[]>([])

  async function loadHistory() {
    try {
      const res = await fetch('/api/admin/logs')
      if (!res.ok) return false
      const data = await res.json()
      setHistory(data.logs || [])
      return true
    } catch {
      // History is a convenience, not critical -- fail silently.
      return false
    }
  }

  // On mount: /api/admin/logs is itself admin-gated, so a successful call
  // doubles as "is the existing cookie still valid" -- no separate
  // whoami endpoint needed.
  useEffect(() => {
    loadHistory().then((ok) => {
      if (ok) setSignedIn(true)
      setCheckingAuth(false)
    })
  }, [])

  async function handleSignIn(e: FormEvent) {
    e.preventDefault()
    setLoginError('')
    setSigningIn(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setSignedIn(true)
        loadHistory()
      } else {
        setLoginError('Wrong password.')
      }
    } finally {
      setSigningIn(false)
    }
  }

  const [actionError, setActionError] = useState('')

  async function runSync() {
    setBusy(true)
    setBusyLabel('Checking Vulcan7 for leads added in the last 3 days…')
    setActionError('')
    try {
      const res = await fetch('/api/admin/vulcan7-sync', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sync failed')
    } catch (err: any) {
      setActionError(err.message)
    } finally {
      setBusy(false)
      setBusyLabel('')
      loadHistory()
    }
  }

  async function runOutreachDryRun() {
    setBusy(true)
    setBusyLabel('Checking who would get an email (dry run — no emails are sent to leads)…')
    setActionError('')
    try {
      const res = await fetch('/api/admin/send-outreach', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Dry run failed')
      setDryRunResult(data)
    } catch (err: any) {
      setActionError(err.message)
    } finally {
      setBusy(false)
      setBusyLabel('')
      loadHistory()
    }
  }

  async function runOutreachReal() {
    if (!dryRunResult || dryRunResult.wouldSendCount === 0) {
      setActionError('Run "Preview" first so you know who this will email.')
      return
    }
    if (!confirm(`Send a real email to ${dryRunResult.wouldSendCount} lead(s) right now? This cannot be undone.`)) {
      return
    }
    setBusy(true)
    setBusyLabel(`Sending to ${dryRunResult.wouldSendCount} lead(s)…`)
    setActionError('')
    try {
      const res = await fetch('/api/admin/send-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Send failed')
      setDryRunResult(null)
    } catch (err: any) {
      setActionError(err.message)
    } finally {
      setBusy(false)
      setBusyLabel('')
      loadHistory()
    }
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
        <form
          onSubmit={handleSignIn}
          className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <h1 className="text-lg font-semibold text-slate-900">Carlos CRM admin</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue.</p>

          <div className="relative mt-5">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {loginError && <p className="mt-2 text-sm font-medium text-red-600">{loginError}</p>}

          <button
            type="submit"
            disabled={signingIn || !password}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            {signingIn && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-xl space-y-6">
        <AdminNav />

        <h1 className="text-xl font-semibold text-slate-900">Sync &amp; outreach</h1>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">1. Pull today&apos;s new leads from Vulcan7</h2>
          <p className="mt-1 text-sm text-slate-500">
            Checks Vulcan7 for contacts added in the last 3 days and pulls full detail (address, DNC, every
            phone/email) for each one.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ActionButton onClick={runSync} disabled={busy} icon={<RefreshCw className="h-4 w-4" />}>
              Run daily sync
            </ActionButton>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">2. Email new leads</h2>
          <p className="mt-1 text-sm text-slate-500">
            Preview always runs first and emails no one — you get a summary instead.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ActionButton onClick={runOutreachDryRun} disabled={busy} icon={<Mail className="h-4 w-4" />}>
              Preview outreach (dry run)
            </ActionButton>
            <ActionButton
              onClick={runOutreachReal}
              disabled={busy || !dryRunResult}
              variant="danger"
              icon={<Send className="h-4 w-4" />}
            >
              Send for real
            </ActionButton>
          </div>
          {dryRunResult && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              Last preview found {dryRunResult.wouldSendCount} lead(s) ready to email.
            </p>
          )}
        </section>

        {(busy || actionError) && (
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-3 text-sm',
              busy && 'bg-blue-50 text-blue-700',
              !busy && actionError && 'bg-red-50 text-red-700',
            )}
          >
            {busy && <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />}
            {!busy && actionError && <AlertTriangle className="h-4 w-4 flex-shrink-0" />}
            <span>{busy ? busyLabel : actionError}</span>
          </div>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <History className="h-4 w-4" />
            History
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Persisted record of every sync and send, including ones nobody was watching happen.
          </p>
          <div className="mt-3 max-h-80 space-y-1.5 overflow-y-auto rounded-lg bg-slate-50 p-3 font-mono text-xs">
            {history.length === 0 && <p className="text-slate-400">Nothing yet.</p>}
            {history.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  'flex items-start gap-1.5',
                  entry.level === 'error' && 'text-red-600',
                  entry.level === 'warn' && 'text-amber-700',
                  entry.level === 'info' && 'text-slate-600',
                )}
              >
                <span className="flex-shrink-0 text-slate-400">
                  {new Date(entry.created_at).toLocaleString()}
                </span>
                <span className="flex-shrink-0 text-slate-400">[{entry.source}]</span>
                <span>{entry.message}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function ActionButton({
  children,
  onClick,
  disabled,
  icon,
  variant = 'primary',
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  icon?: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
      )}
    >
      {icon}
      {children}
    </button>
  )
}
