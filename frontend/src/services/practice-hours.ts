export interface WorkingWindow {
  start: string
  end: string
}
export const weeklyHours: Record<number, WorkingWindow[]> = {
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
}
export function describeHours(weekly: Record<number, WorkingWindow[]>): [string, string][] {
  return ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'].map(
    (name, i) => [
      name,
      (weekly[(i + 1) % 7] ?? []).map((w) => `${w.start}–${w.end}`).join(' · ') || 'Geschlossen',
    ],
  )
}
