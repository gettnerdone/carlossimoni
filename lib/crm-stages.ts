import { Inbox, PhoneCall, Sparkles, Calendar, Home, XCircle } from 'lucide-react'

// Pipeline stages for carlos_crm.leads (docs/carlos-crm-schema.sql). Mirrors
// cmadraft's lib/crm-stages.ts pattern, with Carlos's own stage names
// ('appointment_booked' / 'listed' instead of 'demo_scheduled' / 'won' --
// these are homeowner/seller leads, not realtor software leads).
export type Stage = 'not_contacted' | 'contacted' | 'interested' | 'appointment_booked' | 'listed' | 'lost'

export const STAGE_META: Record<Stage, { label: string; icon: typeof Inbox; dot: string; text: string }> = {
  not_contacted: { label: 'Not Contacted', icon: Inbox, dot: 'bg-gray-400', text: 'text-gray-600' },
  contacted: { label: 'Contacted', icon: PhoneCall, dot: 'bg-blue-500', text: 'text-blue-700' },
  interested: { label: 'Interested', icon: Sparkles, dot: 'bg-purple-500', text: 'text-purple-700' },
  appointment_booked: { label: 'Appointment Booked', icon: Calendar, dot: 'bg-cyan-500', text: 'text-cyan-700' },
  listed: { label: 'Listed', icon: Home, dot: 'bg-green-500', text: 'text-green-700' },
  lost: { label: 'Lost', icon: XCircle, dot: 'bg-red-400', text: 'text-red-600' },
}

export const STAGE_ORDER: Stage[] = ['not_contacted', 'contacted', 'interested', 'appointment_booked', 'listed', 'lost']
