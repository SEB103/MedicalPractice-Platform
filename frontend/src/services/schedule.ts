import { practices } from '../mocks/practice'
export interface WorkingWindow {
  start: string
  end: string
}
export interface ScheduleConfig {
  stepMinutes: number
  bufferMinutes: number
  horizonDays: number
  weekly: Record<number, WorkingWindow[]>
  closedDates: { date: string; reason: string }[]
  absences: { from: string; to: string; reason: string }[]
  overrides: Record<string, WorkingWindow[]>
}
export function datePlus(day: string, n: number): string {
  const date = new Date(day + 'T12:00:00Z')
  date.setUTCDate(date.getUTCDate() + n)
  return date.toISOString().slice(0, 10)
}
export function scheduleFor(today: string): ScheduleConfig {
  const month = new Date(today + 'T12:00:00Z')
  month.setUTCMonth(month.getUTCMonth() + 1, 1)
  while (month.getUTCDay() !== 1) month.setUTCDate(month.getUTCDate() + 1)
  const start = month.toISOString().slice(0, 10)
  return {
    stepMinutes: 15,
    bufferMinutes: 10,
    horizonDays: 90,
    weekly: {
      1: [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '17:00' },
      ],
      2: [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '17:00' },
      ],
      3: [
        { start: '09:00', end: '11:00' },
        { start: '14:00', end: '16:00' },
      ],
      4: [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '17:00' },
      ],
      5: [{ start: '09:00', end: '12:00' }],
    },
    closedDates: [...new Set([today.slice(0, 4), datePlus(today, 90).slice(0, 4)])].flatMap(
      (year) =>
        ['01-01', '12-25', '12-26'].map((day) => ({
          date: year + '-' + day,
          reason: 'Demo-Schließtag',
        })),
    ),
    absences: [{ from: start, to: datePlus(start, 4), reason: 'Praxisurlaub · Demo' }],
    overrides: { [datePlus(start, 7)]: [{ start: '09:00', end: '11:00' }] },
  }
}
export function minutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number)
  return hour! * 60 + minute!
}
export function timeLabel(value: number): string {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
}
export function durationFor(service: string): number {
  const found = Object.values(practices)
    .flatMap((p) => p.services)
    .find((s) => s.title === service)
  return found?.durationMinutes ?? 30
}
export function isKnownService(service: string): boolean {
  return (
    ['Erstgespräch', 'Verlaufsgespräch', 'Ärztliche Beratung'].includes(service) ||
    Object.values(practices).some((p) => p.services.some((s) => s.title === service))
  )
}
export function closureReason(day: string, config: ScheduleConfig): string | undefined {
  return (
    config.closedDates.find((d) => d.date === day)?.reason ||
    config.absences.find((a) => day >= a.from && day <= a.to)?.reason
  )
}
export function windowsFor(day: string, config: ScheduleConfig): WorkingWindow[] {
  if (closureReason(day, config)) return []
  return config.overrides[day] ?? config.weekly[new Date(day + 'T12:00:00Z').getUTCDay()] ?? []
}
