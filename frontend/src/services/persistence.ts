import type { DemoState } from '../types/domain'
import { seedAppointments } from './appointments'
export const STORAGE_KEY = 'medicalpractice-quasar-v1'
export function initialState(): DemoState {
  return {
    version: 1,
    role: 'visitor',
    theme: 'hausarzt',
    mode: 'system',
    appointments: seedAppointments(),
    alternateAddress: false,
    notifications: false,
  }
}
export function parseState(raw: string | null): DemoState {
  if (!raw) return initialState()
  try {
    const s = JSON.parse(raw) as DemoState
    const valid =
      s.version === 1 &&
      ['visitor', 'approved', 'pending'].includes(s.role) &&
      ['hausarzt', 'psychiatry', 'gemeinschaft'].includes(s.theme) &&
      ['light', 'dark', 'system'].includes(s.mode) &&
      typeof s.alternateAddress === 'boolean' &&
      typeof s.notifications === 'boolean' &&
      Array.isArray(s.appointments) &&
      s.appointments.every(
        (a) =>
          typeof a.id === 'string' &&
          typeof a.service === 'string' &&
          (a.durationMinutes === undefined ||
            (Number.isFinite(a.durationMinutes) &&
              a.durationMinutes > 0 &&
              a.durationMinutes <= 240)) &&
          /^\d{4}-\d{2}-\d{2}$/.test(a.date) &&
          !isNaN(Date.parse(a.date)) &&
          /^\d{2}:\d{2}$/.test(a.time) &&
          ['confirmed', 'pending', 'cancelled', 'completed'].includes(a.status),
      )
    if (!valid) return initialState()
    return {
      ...s,
      appointments: s.appointments.map((a) => ({ ...a, durationMinutes: a.durationMinutes ?? 30 })),
    }
  } catch {
    return initialState()
  }
}
