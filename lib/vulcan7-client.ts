// Vulcan7 scraping client -- logs into vulcan7dialer.com with
// VULCAN7_USERNAME/VULCAN7_PASSWORD and pulls contact data from the same
// internal endpoints the Contact Manager page's own JS calls. These are
// UNDOCUMENTED endpoints (not a published API) -- Vulcan7 could change them
// at any time, which would break this. Don't call fetchAllContactsHtml more
// than once a day, and only call fetchContactDetailHtml for contacts you
// actually need full detail on (new leads), never looped over the whole
// 59k+ database.
//
// Ported from C:\Projects\Vulcan7_Sync\vulcan7_sync.py (Python prototype,
// since superseded by this -- kept only as a reference, not run anymore).

import * as cheerio from 'cheerio'

const LOGIN_PAGE_URL = 'https://www.vulcan7.com/login/'
const LOGIN_URL = 'https://www.vulcan7dialer.com/index/login'
const CONTACTS_PAGE_URL = 'https://www.vulcan7dialer.com/cm/index'
const GET_CONTACTS_URL = 'https://www.vulcan7dialer.com/cm/get_contacts'
const CONTACT_DETAIL_URL = 'https://www.vulcan7dialer.com/contact/index'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0 Safari/537.36'

const PHONE_RE = /\(\d{3}\)\s*\d{3}-\d{4}/
const PHONE_RE_G = /\(\d{3}\)\s*\d{3}-\d{4}/g
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/
const EMAIL_RE_G = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
const PRICE_RE = /\$[\d,]+/
const DATE_RE = /[A-Za-z]{3} \d{2}, \d{4} \d{1,2}:\d{2} ?[ap]m/i
const CITY_STATE_RE = /^([A-Za-z .'-]+),\s*([A-Z]{2})\b/
const STREET_ADDRESS_RE =
  /^\d+\s+[A-Za-z0-9.\s]*\b(?:ROAD|RD|STREET|ST|AVENUE|AVE|DRIVE|DR|LANE|LN|COURT|CT|BOULEVARD|BLVD|WAY|CIRCLE|CIR|PLACE|PL|TRAIL|TRL|PARKWAY|PKWY|TERRACE|TER|LOOP|HWY|HIGHWAY)\.?\s*$/i
const CITY_STATE_ZIP_RE = /^([A-Za-z .'-]+),\s*(Florida|FL)\s+(\d{5})/i
const PHONE_LABEL_RE = /\((Mobile|Home|Work|Other|Cell)\)/i

export interface Vulcan7Session {
  cookie: string
}

/** Simple cookie-jar-of-one: Vulcan7's session is a single Set-Cookie header. */
async function fetchFollowingCookies(
  url: string,
  init: RequestInit,
  cookie: string,
): Promise<{ res: Response; cookie: string }> {
  const headers = new Headers(init.headers)
  headers.set('User-Agent', USER_AGENT)
  if (cookie) headers.set('Cookie', cookie)
  const res = await fetch(url, { ...init, headers, redirect: 'manual' })
  const setCookie = res.headers.get('set-cookie')
  const newCookie = setCookie ? mergeCookies(cookie, setCookie) : cookie
  // Follow one redirect manually so we can keep accumulating cookies.
  if (res.status >= 300 && res.status < 400) {
    const location = res.headers.get('location')
    if (location) {
      return fetchFollowingCookies(new URL(location, url).toString(), { method: 'GET' }, newCookie)
    }
  }
  return { res, cookie: newCookie }
}

function mergeCookies(existing: string, setCookieHeader: string): string {
  // setCookieHeader may be multiple cookies joined; Node's fetch only gives
  // us one combined string per call here, which is fine for Vulcan7's
  // single-session-cookie login flow.
  const pair = setCookieHeader.split(';')[0]
  const [name] = pair.split('=')
  const existingParts = existing
    .split('; ')
    .filter((p) => p && !p.startsWith(name + '='))
  existingParts.push(pair)
  return existingParts.join('; ')
}

export async function login(username: string, password: string): Promise<Vulcan7Session> {
  let cookie = ''
  // Prime cookies like a real browser visiting the login page first.
  const primed = await fetchFollowingCookies(LOGIN_PAGE_URL, { method: 'GET' }, cookie)
  cookie = primed.cookie

  const body = new URLSearchParams({ username, password })
  const loggedIn = await fetchFollowingCookies(
    LOGIN_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Referer: LOGIN_PAGE_URL,
      },
      body: body.toString(),
    },
    cookie,
  )
  cookie = loggedIn.cookie

  const check = await fetchFollowingCookies(CONTACTS_PAGE_URL, { method: 'GET' }, cookie)
  cookie = check.cookie
  const checkText = await check.res.text()
  if (checkText.toLowerCase().includes('password') && !checkText.toLowerCase().includes('contacts')) {
    throw new Error(
      'Vulcan7 login appears to have failed -- check VULCAN7_USERNAME / VULCAN7_PASSWORD.',
    )
  }

  return { cookie }
}

export interface ContactSummary {
  contactId: string
  name: string
  email: string | null
  phone: string | null
  price: string | null
  city: string | null
  state: string | null
  dateAddedRaw: string | null
  dateAddedIso: string | null
  propertyType: string | null
  rawText: string
}

export async function fetchAllContactsHtml(session: Vulcan7Session): Promise<string> {
  const params = new URLSearchParams({
    view_id: '0',
    view_data: '',
    view_data_hash: '',
    limit: '500',
    page: '1',
    search_type: 'exact',
    search_field_id: 'Firstname',
    order_by: 'sort-by-layout-field-EAV-_-datetime-_-78',
    direction: 'desc',
    task_campaign_id: '',
    task_campaign_event_id: '',
    event_status: '',
    last_view_id: '0',
    _: String(Date.now()),
  })
  const res = await fetch(`${GET_CONTACTS_URL}?${params.toString()}`, {
    headers: {
      'User-Agent': USER_AGENT,
      Cookie: session.cookie,
      'X-Requested-With': 'XMLHttpRequest',
      Referer: CONTACTS_PAGE_URL,
    },
  })
  if (!res.ok) throw new Error(`get_contacts failed: ${res.status}`)
  return res.text()
}

export function parseContacts(html: string): ContactSummary[] {
  const $ = cheerio.load(html)
  const contacts: ContactSummary[] = []

  $('tr[id^="row-contact-info-"]').each((_, el) => {
    const id = $(el).attr('id') || ''
    const contactId = id.replace('row-contact-info-', '').trim()
    if (!contactId) return

    const rawText = $(el).text()
    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length === 0) return

    const joined = lines.join(' ')
    const emailM = joined.match(EMAIL_RE)
    const phoneM = joined.match(PHONE_RE)
    const priceM = joined.match(PRICE_RE)
    const dateM = joined.match(DATE_RE)

    let city: string | null = null
    let state: string | null = null
    for (const ln of lines) {
      const m = ln.match(CITY_STATE_RE)
      if (m) {
        city = m[1].trim()
        state = m[2].trim()
        break
      }
    }

    const name = lines[0]
    const propertyType = lines.length > 1 ? lines[lines.length - 1] : null

    const dateAddedRaw = dateM ? dateM[0] : null
    let dateAddedIso: string | null = null
    if (dateAddedRaw) {
      const parsed = parseVulcan7Date(dateAddedRaw)
      if (parsed) dateAddedIso = parsed.toISOString()
    }

    contacts.push({
      contactId,
      name,
      email: emailM ? emailM[0] : null,
      phone: phoneM ? phoneM[0] : null,
      price: priceM ? priceM[0] : null,
      city,
      state,
      dateAddedRaw,
      dateAddedIso,
      propertyType,
      rawText,
    })
  })

  return contacts
}

function parseVulcan7Date(raw: string): Date | null {
  // "Nov 05, 2026 3:18 am" -> Date. JS Date.parse handles this format
  // directly once we normalize am/pm spacing/case.
  const normalized = raw.replace(/\s*([ap])m$/i, ' $1M').toUpperCase()
  const d = new Date(normalized)
  return isNaN(d.getTime()) ? null : d
}

export interface ContactDetail {
  contactId: string
  street: string | null
  city: string | null
  state: string | null
  zip: string | null
  phones: { phone: string; label: string | null; dnc: boolean }[]
  dnc: boolean
  emails: string[]
  mlsNumber: string | null
  propertyType: string | null
  listPrice: string | null
  yearBuilt: string | null
  listingOffice: string | null
  listingAgent: string | null
  rawText: string
}

export async function fetchContactDetailHtml(
  session: Vulcan7Session,
  contactId: string,
): Promise<string> {
  const params = new URLSearchParams({
    c_id: contactId,
    contact_number: 'null',
    task_campaign_id: 'undefined',
    task_campaign_event_id: 'undefined',
    call: '0',
    _: String(Date.now()),
  })
  const res = await fetch(`${CONTACT_DETAIL_URL}?${params.toString()}`, {
    headers: {
      'User-Agent': USER_AGENT,
      Cookie: session.cookie,
      'X-Requested-With': 'XMLHttpRequest',
      Referer: CONTACTS_PAGE_URL,
    },
  })
  if (!res.ok) throw new Error(`contact detail failed for ${contactId}: ${res.status}`)
  return res.text()
}

function valueAfterLabel(lines: string[], label: string): string | null {
  const labelLower = label.toLowerCase()
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i].replace(/:$/, '').toLowerCase()
    if (ln === labelLower || lines[i].toLowerCase().startsWith(labelLower + ':')) {
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim()) return lines[j].trim()
      }
    }
  }
  return null
}

export function parseContactDetail(html: string, contactId: string): ContactDetail {
  const $ = cheerio.load(html)
  const rawText = $.root().text()
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  let street: string | null = null
  let city: string | null = null
  let state: string | null = null
  let zip: string | null = null
  for (let i = 0; i < lines.length; i++) {
    if (STREET_ADDRESS_RE.test(lines[i])) {
      street = lines[i]
      for (const nxt of lines.slice(i + 1, i + 3)) {
        const m = nxt.match(CITY_STATE_ZIP_RE)
        if (m) {
          city = m[1].trim()
          const stateRaw = m[2].trim().toUpperCase()
          state = stateRaw === 'FLORIDA' ? 'FL' : stateRaw
          zip = m[3]
          break
        }
      }
      break
    }
  }

  // Unlike cmadraft's layout, Vulcan7's detail page renders each phone as
  // its own line, its (Mobile)/(Home)/etc label as the NEXT line, and --
  // only if that number is DNC-flagged -- a bare "DNC" line right after
  // that: "(954) 873-6828" / "(Mobile)" / "DNC". So DNC is never on the
  // same line as the phone number itself; it has to be looked for in the
  // following 1-2 lines. The same number can also appear elsewhere on the
  // page without that context (e.g. a "Local time" sidebar line) -- dedupe
  // by number, OR-ing the DNC flag and keeping the first real label seen,
  // so a contextless rendering can't clobber a correctly-detected one.
  const phoneMap = new Map<string, { label: string | null; dnc: boolean }>()
  for (let i = 0; i < lines.length; i++) {
    const phoneM = lines[i].match(PHONE_RE)
    if (!phoneM) continue
    const number = phoneM[0]
    let j = i + 1
    let label: string | null = null
    const labelM = lines[j]?.match(PHONE_LABEL_RE)
    if (labelM) {
      label = labelM[1]
      j++
    }
    const isDnc = lines[j]?.trim().toUpperCase() === 'DNC'
    const existing = phoneMap.get(number)
    phoneMap.set(number, {
      label: existing?.label ?? label,
      dnc: (existing?.dnc ?? false) || isDnc,
    })
  }
  const phones = Array.from(phoneMap, ([phone, v]) => ({ phone, label: v.label, dnc: v.dnc }))
  const anyDnc = phones.some((p) => p.dnc)

  const emails = Array.from(new Set(rawText.match(EMAIL_RE_G) || []))

  return {
    contactId,
    street,
    city,
    state,
    zip,
    phones,
    dnc: anyDnc,
    emails,
    mlsNumber: valueAfterLabel(lines, 'MLS Number'),
    propertyType: valueAfterLabel(lines, 'Property Type'),
    listPrice: valueAfterLabel(lines, 'List Price'),
    yearBuilt: valueAfterLabel(lines, 'Year Built'),
    listingOffice: valueAfterLabel(lines, 'Listing Office'),
    listingAgent: valueAfterLabel(lines, 'Listing Agent'),
    rawText,
  }
}

export function parsePrice(priceStr: string | null): number | null {
  if (!priceStr) return null
  const digits = priceStr.replace(/,/g, '').match(/[\d.]+/)
  if (!digits) return null
  const n = parseFloat(digits[0])
  return isNaN(n) ? null : n
}
