import { expect, it, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { isUpcoming } from '../src/services/appointments'
import { serviceFromRoute } from '../src/services/service-catalog'
import { weeklyHours, describeHours } from '../src/services/practice-hours'
import { scheduleFor } from '../src/services/schedule'
import { practiceContact } from '../src/services/practice-config'
import { usePatientService } from '../src/services/patient-service'
import { useDemoStore } from '../src/stores/demo'
beforeEach(() => setActivePinia(createPinia()))
it('uses Berlin time in summer, winter and across UTC midnight', () => {
  const a = {
    id: 'a',
    date: '2026-10-17',
    time: '09:00',
    service: 'Test',
    status: 'confirmed' as const,
  }
  expect(isUpcoming(a, new Date('2026-10-17T08:00:00Z'))).toBe(false)
  expect(isUpcoming({ ...a, time: '11:00' }, new Date('2026-10-17T08:00:00Z'))).toBe(true)
  expect(isUpcoming({ ...a, date: '2026-12-17' }, new Date('2026-12-17T08:01:00Z'))).toBe(false)
  expect(
    isUpcoming({ ...a, date: '2026-10-18', time: '00:30' }, new Date('2026-10-17T23:00:00Z')),
  ).toBe(false)
  expect(isUpcoming({ ...a, status: 'cancelled', date: '2099-01-01' })).toBe(false)
})
it('shares weekly hours and retains old numeric service links', () => {
  expect(scheduleFor('2026-10-17').weekly).toEqual(weeklyHours)
  expect(practiceContact.consultationHours).toEqual(describeHours(weeklyHours))
  const old = serviceFromRoute('hausarzt', '0')!
  expect(serviceFromRoute('hausarzt', old.id)).toEqual(old)
  expect(serviceFromRoute('hausarzt', '-1')).toBeUndefined()
})
it('rejects stale profile bookings and new legacy-only services', async () => {
  const demo = useDemoStore()
  demo.state.role = 'approved'
  demo.state.theme = 'psychiatry'
  const api = usePatientService()
  await expect(
    api.book({ date: '2099-01-01', time: '09:00', service: 'Hausärztliche Beratung' }),
  ).rejects.toThrow('Praxisprofil')
  await expect(
    api.book({ date: '2099-01-01', time: '09:00', service: 'Erstgespräch' }),
  ).rejects.toThrow('Praxisprofil')
  const pending = api.book({
    date: '2099-01-01',
    time: '09:00',
    service: demo.practice.services[0]!.title,
  })
  demo.state.theme = 'hausarzt'
  await expect(pending).rejects.toThrow('Praxisprofil')
})
