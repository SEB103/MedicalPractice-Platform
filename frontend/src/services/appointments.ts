import { serviceById } from './service-catalog'
import {
  scheduleFor,
  windowsFor,
  minutes,
  timeLabel,
  durationFor,
  isKnownService,
  type ScheduleConfig,
} from './schedule'
import type { Appointment, Booking } from '../types/domain'
export function berlinToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  return ['year', 'month', 'day']
    .map((key) => parts.find((part) => part.type === key)?.value)
    .join('-')
}
export function addDays(day: string, amount: number): string {
  const value = new Date(day + 'T12:00:00Z')
  value.setUTCDate(value.getUTCDate() + amount)
  return value.toISOString().slice(0, 10)
}
export function isWorkday(day: string): boolean {
  const value = new Date(day + 'T12:00:00Z').getUTCDay()
  return value > 0 && value < 6
}
export function nextWorkday(day: string): string {
  let value = addDays(day, 1)
  while (!isWorkday(value)) value = addDays(value, 1)
  return value
}
export function isBookableDate(
  day: string,
  today = berlinToday(),
  config = scheduleFor(today),
): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    day > today &&
    day <= addDays(today, config.horizonDays) &&
    !isNaN(Date.parse(day)) &&
    new Date(day + 'T12:00:00Z').toISOString().startsWith(day) &&
    windowsFor(day, config).length > 0
  )
}
export function canChange(item: Appointment, today = berlinToday()): boolean {
  return ['confirmed', 'pending'].includes(item.status) && item.date > today
}
export function slotsFor(
  day: string,
  records: Appointment[],
  today = berlinToday(),
  durationMinutes = 30,
  config: ScheduleConfig = scheduleFor(today),
  ignoreId?: string,
): string[] {
  if (
    !isBookableDate(day, today, config) ||
    !Number.isFinite(durationMinutes) ||
    durationMinutes <= 0
  )
    return []
  const busy = records.filter(
    (a) => a.date === day && a.id !== ignoreId && ['pending', 'confirmed'].includes(a.status),
  )
  const slots: string[] = []
  for (const window of windowsFor(day, config)) {
    for (
      let start = minutes(window.start);
      start + durationMinutes <= minutes(window.end);
      start += config.stepMinutes
    ) {
      if (
        !busy.some(
          (a) =>
            start < minutes(a.time) + (a.durationMinutes ?? 30) + config.bufferMinutes &&
            start + durationMinutes + config.bufferMinutes > minutes(a.time),
        )
      )
        slots.push(timeLabel(start))
    }
  }
  return slots
}
export function firstAvailableDate(
  records: Appointment[],
  duration = 30,
  today = berlinToday(),
  ignoreId?: string,
): string | null {
  const config = scheduleFor(today)
  for (let offset = 1; offset <= config.horizonDays; offset++) {
    const day = addDays(today, offset)
    if (slotsFor(day, records, today, duration, config, ignoreId).length) return day
  }
  return null
}
export function createBooking(
  records: Appointment[],
  input: Booking,
  id: string,
  replaceId?: string,
  today = berlinToday(),
): Appointment[] {
  const original = replaceId ? records.find((item) => item.id === replaceId) : undefined
  if (replaceId && (!original || !canChange(original, today)))
    throw new Error('Dieser Termin kann nicht mehr verschoben werden.')
  const selected =
    input.practiceProfile && input.serviceId
      ? serviceById(input.practiceProfile, input.serviceId)
      : undefined
  const duration =
    selected?.durationMinutes ??
    (original?.service === input.service ? original.durationMinutes : undefined) ??
    durationFor(input.service)
  if (
    (input.serviceId && (!selected || selected.title !== input.service)) ||
    !isKnownService(input.service) ||
    (original?.date === input.date && original.time === input.time) ||
    !slotsFor(input.date, records, today, duration, scheduleFor(today), replaceId).includes(
      input.time,
    )
  )
    throw new Error('Der Termin ist nicht mehr verfügbar. Bitte wählen Sie eine andere Uhrzeit.')
  const next = records.map((item) =>
    item.id === replaceId ? { ...item, status: 'cancelled' as const } : item,
  )
  return [...next, { ...input, durationMinutes: duration, id, status: 'pending' }]
}
export function cancelBooking(
  records: Appointment[],
  id: string,
  today = berlinToday(),
): Appointment[] {
  const item = records.find((record) => record.id === id)
  if (!item || !canChange(item, today))
    throw new Error('Dieser Termin kann nicht mehr abgesagt werden.')
  return records.map((record) => (record.id === id ? { ...record, status: 'cancelled' } : record))
}
export function seedAppointments(today = berlinToday()): Appointment[] {
  const seedDay = (offset: number) => {
    for (let i = offset; i <= 90; i++) {
      const d = addDays(today, i)
      if (slotsFor(d, [], today).length) return d
    }
    return nextWorkday(addDays(today, offset))
  }
  return [
    {
      id: 'demo-1',
      date: seedDay(3),
      time: '09:00',
      service: 'Erstgespräch',
      durationMinutes: 30,
      status: 'confirmed',
    },
    {
      id: 'demo-2',
      date: seedDay(12),
      time: '09:00',
      service: 'Verlaufsgespräch',
      durationMinutes: 30,
      status: 'pending',
    },
    {
      id: 'demo-3',
      date: addDays(today, -9),
      time: '11:00',
      service: 'Ärztliche Beratung',
      durationMinutes: 30,
      status: 'completed',
    },
  ]
}
export function formatDate(day: string): string {
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'long', timeZone: 'Europe/Berlin' }).format(
    new Date(day + 'T12:00:00Z'),
  )
}

export function isUpcoming(item: Appointment, now = new Date()): boolean {
  if (!['confirmed', 'pending'].includes(item.status)) return false
  const today = berlinToday(now)
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(now)
  return item.date > today || (item.date === today && item.time >= time)
}
