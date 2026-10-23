/** Typed /api/v1/ endpoints and mapping to the prototype's domain types (see docs/api/openapi.yaml). */
import { api } from './http'
import type { Appointment, AppointmentStatus, Role } from '../types/domain'
import type { WagtailImageDto } from '../types/content'

export interface PatientDto {
  first_name: string
  last_name: string
  birth_date: string
  phone: string
  street: string
  postal_code: string
  city: string
  status: 'pending' | 'approved' | 'rejected' | 'blocked'
  account_linked: boolean
}
export interface MeDto {
  email: string
  patient: PatientDto | null
}
export interface ServiceDto {
  id: number
  title: string
  description: string
  icon: string
  duration_minutes: number
}
export interface ScheduleDto {
  weekly: { weekday: number; start: string; end: string }[]
  closures: { start_date: string; end_date: string; reason: string }[]
  special_hours: { date: string; start: string; end: string }[]
  slot_step_minutes: number
  buffer_minutes: number
  horizon_days: number
}
interface AvailabilityDto {
  service: number
  duration_minutes: number
  days: { date: string; slots: string[] }[]
}
interface AppointmentDto {
  id: number
  service: ServiceDto | null
  start: string
  end: string
  status: string
  decline_reason: string
  replaces: number | null
  can_change: boolean
}
export interface RegistrationInput {
  email: string
  password: string
  first_name: string
  last_name: string
  birth_date: string
  phone: string
  street: string
  postal_code: string
  city: string
  privacy_accepted: boolean
}
/** date (YYYY-MM-DD) → list of { time (HH:mm Berlin), start (ISO with offset) } */
export type AvailabilityMap = Record<string, { time: string; start: string }[]>

const berlin = (iso: string, options: Intl.DateTimeFormatOptions, locale = 'en-CA') =>
  new Intl.DateTimeFormat(locale, { timeZone: 'Europe/Berlin', ...options }).format(new Date(iso))
export const berlinDate = (iso: string) => berlin(iso, { year: 'numeric', month: '2-digit', day: '2-digit' })
export const berlinTime = (iso: string) =>
  berlin(iso, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }, 'en-GB')

const STATUS: Record<string, AppointmentStatus> = {
  requested: 'pending',
  confirmed: 'confirmed',
  completed: 'completed',
  cancelled: 'cancelled',
  declined: 'declined',
  no_show: 'no_show',
  expired: 'expired',
}

export function roleFor(me: MeDto | null): Role {
  if (!me?.patient) return 'visitor'
  return me.patient.status === 'approved' ? 'approved' : 'pending'
}

function toAppointment(dto: AppointmentDto): Appointment {
  return {
    id: String(dto.id),
    date: berlinDate(dto.start),
    time: berlinTime(dto.start),
    service: dto.service?.title ?? 'Termin',
    ...(dto.service ? { serviceId: String(dto.service.id) } : {}),
    durationMinutes: Math.round((Date.parse(dto.end) - Date.parse(dto.start)) / 60000),
    status: STATUS[dto.status] ?? 'cancelled',
    ...(dto.decline_reason ? { note: dto.decline_reason } : {}),
  }
}

export const authApi = {
  async me(): Promise<MeDto | null> {
    try {
      return await api<MeDto>('me/')
    } catch (error) {
      if ((error as { status?: number }).status === 401) return null
      throw error
    }
  },
  login: (email: string, password: string) =>
    api<MeDto>('auth/login/', { method: 'POST', body: { email, password } }),
  logout: () => api<void>('auth/logout/', { method: 'POST' }),
  register: (input: RegistrationInput) => api<unknown>('auth/register/', { method: 'POST', body: input }),
  requestPasswordReset: (email: string) =>
    api<unknown>('auth/password-reset/', { method: 'POST', body: { email } }),
  confirmPasswordReset: (uid: string, token: string, newPassword: string) =>
    api<void>('auth/password-reset/confirm/', {
      method: 'POST',
      body: { uid, token, new_password: newPassword },
    }),
  updateContact: (contact: Pick<PatientDto, 'phone' | 'street' | 'postal_code' | 'city'>) =>
    api<MeDto>('me/', { method: 'PATCH', body: contact }),
}

export const practiceApi = {
  services: () => api<ServiceDto[]>('services/'),
  schedule: () => api<ScheduleDto>('practice/schedule/'),
  async availability(serviceId: string): Promise<AvailabilityMap> {
    const data = await api<AvailabilityDto>('availability/', { query: { service: serviceId } })
    return Object.fromEntries(
      data.days.map((day) => [day.date, day.slots.map((start) => ({ time: berlinTime(start), start }))]),
    )
  },
}

export const appointmentsApi = {
  list: async () => (await api<AppointmentDto[]>('appointments/')).map(toAppointment),
  book: async (serviceId: string, start: string) =>
    toAppointment(
      await api<AppointmentDto>('appointments/', {
        method: 'POST',
        body: { service: Number(serviceId), start },
      }),
    ),
  reschedule: async (id: string, start: string) =>
    toAppointment(
      await api<AppointmentDto>(`appointments/${id}/reschedule/`, { method: 'POST', body: { start } }),
    ),
  cancel: async (id: string) =>
    toAppointment(await api<AppointmentDto>(`appointments/${id}/cancel/`, { method: 'POST' })),
}

export interface ContentSectionDto {
  heading: string
  paragraphs: string[]
}
export interface ContentDto {
  site: {
    specialty: string
    headline: string
    intro: string
    hero: { eyebrow: string; lead: string; emphasis: string; note: string; image: WagtailImageDto | null }
    portrait: WagtailImageDto | null
    values: { icon: string; title: string; text: string }[]
    about: ContentSectionDto[]
    gallery: (WagtailImageDto | null)[]
  }
  contact: {
    location_label: string
    address: string
    address_verified: boolean
    place_id: string
    phone: string
    phone_notice: string
    email: string
    telephone_hours: string
  }
  appearance: { palette: string; custom_primary: string }
  faq: { q: string; a: string }[]
  legal: Record<string, { title: string; intro: string; sections: { heading: string; text: string }[] }>
  services: { id: string; introduction: string; sections: ContentSectionDto[]; preparation: string[] }[]
}

export const contentApi = {
  get: () => api<ContentDto>('content/'),
}
