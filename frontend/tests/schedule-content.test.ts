import { describe, expect, it } from 'vitest'
import { createBooking, slotsFor, seedAppointments } from '../src/services/appointments'
import { scheduleFor, durationFor } from '../src/services/schedule'
import { parseState, initialState } from '../src/services/persistence'
import { contentProvider, mapWagtailImage } from '../src/services/content'
import type { Appointment } from '../src/types/domain'
const today = '2026-10-11'
describe('Duration-aware availability', () => {
  it('does not allow a long visit across lunch or closing', () => {
    const slots = slotsFor('2026-10-12', [], today, 60)
    expect(slots).toContain('11:00')
    expect(slots).not.toContain('11:15')
    expect(slots).not.toContain('12:00')
    expect(slots).not.toContain('16:15')
  })
  it('uses distinct catalog durations', () => {
    expect(durationFor('Psychiatrisches Erstgespräch')).toBe(60)
    expect(durationFor('Befundbesprechung')).toBe(20)
    expect(durationFor('Psychotherapeutische Beratung')).toBe(50)
  })
  it('blocks overlap at different start times and respects buffers', () => {
    const records: Appointment[] = [
      {
        id: 'busy',
        date: '2026-10-12',
        time: '10:00',
        durationMinutes: 60,
        service: 'Test',
        status: 'confirmed',
      },
    ]
    const slots = slotsFor('2026-10-12', records, today, 30)
    expect(slots).toContain('09:15')
    expect(slots).not.toContain('09:45')
    expect(slots).not.toContain('10:30')
    expect(slots).not.toContain('11:00')
    expect(slots).toContain('11:15')
  })
  it('honors Wednesday break, weekends, closure dates, vacation and overrides', () => {
    const config = scheduleFor(today)
    expect(slotsFor('2026-10-14', [], today, 30)).not.toContain('11:00')
    expect(slotsFor('2026-10-17', [], today, 30)).toEqual([])
    expect(slotsFor('2026-12-25', [], today, 30)).toEqual([])
    const leave = config.absences[0]!
    expect(slotsFor(leave.from, [], today, 30)).toEqual([])
    expect(slotsFor(leave.to, [], today, 30)).toEqual([])
    const reduced = Object.keys(config.overrides)[0]!
    expect(slotsFor(reduced, [], today, 30)).not.toContain('11:00')
    expect(slotsFor(reduced, [], today, 30)).toContain('10:30')
  })
  it('persists duration snapshot and rejects overlap for a second service', () => {
    const booked = createBooking(
      [],
      { date: '2026-10-12', time: '09:00', service: 'Psychiatrisches Erstgespräch' },
      'new',
      undefined,
      today,
    )
    expect(booked[0]?.durationMinutes).toBe(60)
    expect(() =>
      createBooking(
        booked,
        { date: '2026-10-12', time: '09:30', service: 'Befundbesprechung' },
        'other',
        undefined,
        today,
      ),
    ).toThrow()
  })
  it('can move an appointment into space it frees without self-conflict', () => {
    const records = createBooking(
      [],
      { date: '2026-10-12', time: '09:00', service: 'Psychiatrisches Erstgespräch' },
      'old',
      undefined,
      today,
    )
    const moved = createBooking(
      records,
      { date: '2026-10-12', time: '09:15', service: 'Psychiatrisches Erstgespräch' },
      'new',
      'old',
      today,
    )
    expect(moved[0]?.status).toBe('cancelled')
    expect(moved[1]?.time).toBe('09:15')
  })
  it('rejects an unchanged rescheduling request', () => {
    const input = { date: '2026-10-12', time: '09:00', service: 'Psychiatrisches Erstgespräch' }
    const records = createBooking([], input, 'old', undefined, today)
    expect(() => createBooking(records, input, 'new', 'old', today)).toThrow()
  })
  it('seeds valid dates even near month-end and vacation boundaries', () => {
    for (const date of ['2026-10-28', '2026-11-01', '2026-12-24']) {
      for (const a of seedAppointments(date).filter((a) => a.status !== 'completed'))
        expect(slotsFor(a.date, [], date, a.durationMinutes)).toContain(a.time)
    }
  })
  it('migrates old records without losing their role or bookings', () => {
    const old = initialState()
    old.role = 'approved'
    old.appointments.forEach((a) => delete a.durationMinutes)
    const restored = parseState(JSON.stringify(old))
    expect(restored.role).toBe('approved')
    expect(restored.appointments).toHaveLength(3)
    expect(restored.appointments.every((a) => a.durationMinutes === 30)).toBe(true)
  })
})
describe('CMS content boundary', () => {
  it('maps renditions, alt text, caption and crop position without mutating input', () => {
    const dto = {
      id: 5,
      alt: 'Praxisraum',
      caption: 'Beispiel',
      renditions: [
        { url: '/large.webp', width: 1600, height: 1200 },
        { url: '/small.webp', width: 640, height: 480 },
      ],
      focal_point: { x_percent: 65, y_percent: 40 },
    }
    const media = mapWagtailImage(dto)
    expect(media.srcset).toBe('/small.webp 640w, /large.webp 1600w')
    expect(media.focalPoint).toEqual({ x: 65, y: 40 })
    expect(media.alt).toBe('Praxisraum')
    expect(dto.renditions[0]?.width).toBe(1600)
  })
  it('rejects images without usable renditions', () =>
    expect(() => mapWagtailImage({ id: 1, alt: '', caption: '', renditions: [] })).toThrow())
  it.each(['hausarzt', 'psychiatry', 'gemeinschaft'] as const)(
    'provides independent structured content for %s',
    async (theme) => {
      const content = await contentProvider.get(theme)
      expect(content.theme).toBe(theme)
      expect(content.serviceDetails).toHaveLength(4)
      content.hero.lead = 'changed'
      expect((await contentProvider.get(theme)).hero.lead).not.toBe('changed')
    },
  )
})
