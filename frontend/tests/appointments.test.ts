import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import {
  addDays,
  berlinToday,
  canChange,
  cancelBooking,
  createBooking,
  isBookableDate,
  nextWorkday,
  seedAppointments,
  slotsFor,
} from '../src/services/appointments'
import { initialState, parseState, STORAGE_KEY } from '../src/services/persistence'
import { protectedRedirect } from '../src/router/guard'
import { useDemoStore } from '../src/stores/demo'
import { usePatientService } from '../src/services/patient-service'
const today = '2026-10-11'
const booking = { date: '2026-10-12', time: '09:00', service: 'Erstgespräch' }
describe('Booking rules', () => {
  it('calculates the date in Berlin across midnight and DST', () => {
    expect(berlinToday(new Date('2026-10-10T23:15:00Z'))).toBe('2026-10-11')
    expect(berlinToday(new Date('2026-10-25T23:15:00Z'))).toBe('2026-10-26')
  })
  it('finds next working day after Friday', () =>
    expect(nextWorkday('2026-10-09')).toBe('2026-10-12'))
  it('rejects today, past, weekends and outside booking horizon', () => {
    for (const date of [today, '2026-10-10', '2026-10-17', addDays(today, 91)])
      expect(isBookableDate(date, today)).toBe(false)
    expect(isBookableDate(booking.date, today)).toBe(true)
  })
  it('does not offer Friday afternoons', () =>
    expect(slotsFor('2026-10-16', [], today).every((time) => time < '12:00')).toBe(true))
  it('creates a pending request without mutating original records', () => {
    const original = seedAppointments(today)
    const next = createBooking(original, booking, 'new', undefined, today)
    expect(next).toHaveLength(4)
    expect(next.at(-1)?.status).toBe('pending')
    expect(original).toHaveLength(3)
  })
  it('rejects duplicate slots and restores cancelled slots', () => {
    const next = createBooking([], booking, 'new', undefined, today)
    expect(() => createBooking(next, booking, 'duplicate', undefined, today)).toThrow(
      'nicht mehr verfügbar',
    )
    expect(slotsFor(booking.date, cancelBooking(next, 'new', today), today)).toContain(booking.time)
  })
  it('keeps original appointment when rescheduling conflicts', () => {
    const records = createBooking(seedAppointments(today), booking, 'occupied', undefined, today)
    expect(() => createBooking(records, booking, 'replacement', 'demo-1', today)).toThrow()
    expect(records.find((a) => a.id === 'demo-1')?.status).toBe('confirmed')
  })
  it('atomically cancels original when new request succeeds', () => {
    const next = createBooking(seedAppointments(today), booking, 'replacement', 'demo-1', today)
    expect(next.find((a) => a.id === 'demo-1')?.status).toBe('cancelled')
    expect(next.find((a) => a.id === 'replacement')?.status).toBe('pending')
  })
  it('does not modify missing, completed or cancelled records', () => {
    const records = seedAppointments(today)
    expect(() => cancelBooking(records, 'demo-3', today)).toThrow()
    expect(() => createBooking(records, booking, 'new', 'missing', today)).toThrow()
    expect(canChange(records[2]!, today)).toBe(false)
  })
})
describe('Persistence and navigation', () => {
  it('restores valid theme, role and records', () => {
    const state = initialState()
    state.role = 'approved'
    state.theme = 'psychiatry'
    state.mode = 'dark'
    expect(parseState(JSON.stringify(state))).toEqual(state)
  })
  it.each(['null', 'broken', '{}', '{"version":2}', '{"version":1,"appointments":[null]}'])(
    'recovers from damaged storage: %s',
    (raw) => expect(parseState(raw).role).toBe('visitor'),
  )
  it('guards visitor and pending patient routes while allowing public pages', () => {
    expect(protectedRedirect('/patient/overview', 'visitor')).toBe('/anmelden')
    expect(protectedRedirect('/patient/calendar', 'pending')).toBe('/freigabe')
    expect(protectedRedirect('/patient/calendar', 'approved')).toBeUndefined()
    expect(protectedRedirect('/kontakt', 'visitor')).toBeUndefined()
  })
})
describe('Async patient service', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-11T12:00:00Z'))
    setActivePinia(createPinia())
    const memory = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => memory.get(key) || null,
      setItem: (key: string, value: string) => memory.set(key, value),
    })
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })
  async function flush<T>(promise: Promise<T>): Promise<T> {
    const result = promise.then(
      (value) => ({ value }),
      (error) => ({ error }),
    )
    await vi.runAllTimersAsync()
    const outcome = await result
    if ('error' in outcome) throw outcome.error
    return outcome.value
  }
  it('blocks writes for visitors and pending users', async () => {
    const demo = useDemoStore()
    const api = usePatientService()
    await expect(flush(api.book(booking))).rejects.toThrow('freigegebener')
    demo.state.role = 'pending'
    await expect(flush(api.cancel('demo-1'))).rejects.toThrow('freigegebener')
  })
  it('rechecks role after asynchronous delay (logout during request)', async () => {
    const demo = useDemoStore()
    demo.state.role = 'approved'
    const pending = usePatientService().book(booking)
    demo.state.role = 'visitor'
    await expect(flush(pending)).rejects.toThrow('freigegebener')
    expect(demo.state.appointments).toHaveLength(3)
  })
  it('runs approved booking, listing, cancellation and reload', async () => {
    const demo = useDemoStore()
    demo.state.role = 'approved'
    const api = usePatientService()
    const record = await flush(api.book(booking))
    expect((await flush(api.list())).some((a) => a.id === record.id)).toBe(true)
    await flush(api.cancel(record.id))
    expect(demo.state.appointments.find((a) => a.id === record.id)?.status).toBe('cancelled')
    expect(parseState(localStorage.getItem(STORAGE_KEY)).appointments).toEqual(
      demo.state.appointments,
    )
  })
  it('survives injected failure without partial mutation and permits retry', async () => {
    const demo = useDemoStore()
    demo.state.role = 'approved'
    demo.failNext = true
    const api = usePatientService()
    await expect(flush(api.book(booking))).rejects.toThrow('Verbindungsfehler')
    expect(demo.state.appointments).toHaveLength(3)
    await flush(api.book(booking))
    expect(demo.state.appointments).toHaveLength(4)
  })
  it('serializes concurrent duplicate bookings through validation', async () => {
    useDemoStore().state.role = 'approved'
    const api = usePatientService()
    const results = Promise.allSettled([api.book(booking), api.book(booking)])
    await vi.runAllTimersAsync()
    expect((await results).map((result) => result.status).sort()).toEqual(['fulfilled', 'rejected'])
  })
  it('reset restores visitor and seeded data', () => {
    const demo = useDemoStore()
    demo.state.role = 'approved'
    demo.state.appointments = []
    demo.reset()
    expect(demo.state.role).toBe('visitor')
    expect(demo.state.appointments).toHaveLength(3)
  })
})
