import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { customTokens, contrast, parseAppearance, defaults } from '../src/services/appearance'
import { mapLinks, phoneLink, practiceContact } from '../src/services/practice-config'
import { useDemoStore } from '../src/stores/demo'
import { useAppearanceStore, APPEARANCE_KEY } from '../src/stores/appearance'
import { usePatientService } from '../src/services/patient-service'
import { firstAvailableDate, slotsFor } from '../src/services/appointments'
import { durationFor } from '../src/services/schedule'
import { initialState, STORAGE_KEY } from '../src/services/persistence'

beforeEach(() => {
  const data = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => data.set(k, v),
  })
  setActivePinia(createPinia())
})

describe('Custom colors', () => {
  for (const hex of [
    '#ffffff',
    '#000000',
    '#ffff00',
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ff00ff',
    '#356653',
  ]) {
    for (const dark of [false, true]) {
      it(`${hex} ${dark ? 'dark' : 'light'} retains readable text and actions`, () => {
        const t = customTokens(hex, dark)
        for (const ink of [t.ink, t.muted, t.primary])
          for (const surface of [t.surface, t.card, t.hero])
            expect(contrast(ink, surface)).toBeGreaterThanOrEqual(4.5)
        expect(contrast(t.primary, t['primary-on'])).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
  it('rejects invalid persisted values', () => {
    expect(parseAppearance('{bad')).toEqual(defaults())
    expect(
      parseAppearance(JSON.stringify({ version: 1, palette: 'custom', customPrimary: 'url(bad)' })),
    ).toEqual(defaults())
  })
  it('migrates old color once without changing medical profile or bookings', async () => {
    const legacy = { ...initialState(), theme: 'psychiatry' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy))
    const demo = useDemoStore(),
      appearance = useAppearanceStore()
    expect(appearance.config.palette).toBe('pflaume')
    const before = JSON.stringify({
      practice: demo.practice,
      content: demo.content,
      bookings: demo.state.appointments,
    })
    appearance.config = { version: 1, palette: 'stahlblau', customPrimary: '#356653' }
    await nextTick()
    expect(
      JSON.stringify({
        practice: demo.practice,
        content: demo.content,
        bookings: demo.state.appointments,
      }),
    ).toBe(before)
    expect(parseAppearance(localStorage.getItem(APPEARANCE_KEY)).palette).toBe('stahlblau')
    demo.state.theme = 'gemeinschaft'
    expect(appearance.config.palette).toBe('stahlblau')
    appearance.reset()
    expect(demo.state.theme).toBe('gemeinschaft')
    expect(appearance.config).toEqual(defaults())
  })
  it('reports unavailable storage without breaking the page', async () => {
    const appearance = useAppearanceStore()
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw Error('blocked')
      },
      setItem: () => {
        throw Error('blocked')
      },
    })
    appearance.config.palette = 'custom'
    await nextTick()
    expect(appearance.storageAvailable).toBe(false)
  })
})

describe('Contact actions', () => {
  it('uses the explicitly requested Rathaus demo destination', () => {
    expect(practiceContact.locationLabel).toContain('Rathaus Göppingen')
    expect(new URL(mapLinks(practiceContact)!.route).searchParams.get('destination')).toBe(
      'Hauptstraße 1, 73033 Göppingen, Deutschland',
    )
  })
  it('never sends users to an invented practice address', () =>
    expect(mapLinks({ ...practiceContact, addressVerified: false })).toBeNull())
  it('encodes verified addresses and optional place IDs without requesting an origin', () => {
    const c = {
      ...practiceContact,
      address: 'Straße 1 & Hof, Köln',
      addressVerified: true,
      placeId: 'verified-id',
    }
    const links = mapLinks(c)!
    const map = new URL(links.map),
      route = new URL(links.route)
    expect(map.origin).toBe('https://www.google.com')
    expect(map.searchParams.get('query')).toBe(c.address)
    expect(map.searchParams.get('query_place_id')).toBe(c.placeId)
    expect(route.searchParams.get('api')).toBe('1')
    expect(route.searchParams.get('destination')).toBe(c.address)
    expect(route.searchParams.get('destination_place_id')).toBe(c.placeId)
    expect(route.searchParams.has('origin')).toBe(false)
  })
  it('makes dial links only for configured phone numbers', () => {
    expect(phoneLink(null)).toBeUndefined()
    expect(phoneLink('not configured')).toBeUndefined()
    expect(phoneLink('+49 (0) 123-45')).toBe('tel:+49012345')
  })
})

describe('Booking guards and controlled failures', () => {
  it('does not let public browsing bypass approval', async () => {
    const demo = useDemoStore(),
      api = usePatientService()
    for (const role of ['visitor', 'pending'] as const) {
      demo.state.role = role
      await expect(
        api.book({ date: '2099-01-01', time: '09:00', service: 'Erstgespräch' }),
      ).rejects.toThrow('freigegebener')
    }
  })
  it('keeps the old appointment after conflict and saves a pending request on retry', async () => {
    const demo = useDemoStore(),
      api = usePatientService()
    demo.state.role = 'approved'
    const original = demo.state.appointments[0]!
    const service = original.service
    const day = firstAvailableDate(demo.state.appointments, durationFor(service))!
    const time = slotsFor(day, demo.state.appointments, undefined, durationFor(service))[0]!
    demo.conflictNext = true
    await expect(api.book({ date: day, time, service }, original.id)).rejects.toThrow('Konflikt')
    expect(demo.state.appointments.find((a) => a.id === original.id)?.status).toBe('confirmed')
    const result = await api.book({ date: day, time, service }, original.id)
    expect(result.status).toBe('pending')
    expect(demo.state.appointments.find((a) => a.id === original.id)?.status).toBe('cancelled')
    await api.cancel(result.id)
    expect(slotsFor(day, demo.state.appointments, undefined, durationFor(service))).toContain(time)
  })
})
