import { describe, expect, it } from 'vitest'
import { berlinDate, berlinTime, roleFor, type MeDto } from '../src/services/api'

const patient = (status: 'pending' | 'approved' | 'rejected' | 'blocked'): MeDto => ({
  email: 'max@example.invalid',
  patient: {
    first_name: 'Max',
    last_name: 'Mustermann',
    birth_date: '1980-05-17',
    phone: '',
    street: '',
    postal_code: '',
    city: '',
    status,
    account_linked: false,
  },
})

describe('real API mapping', () => {
  it('maps the server patient status to the prototype role', () => {
    expect(roleFor(null)).toBe('visitor')
    expect(roleFor({ email: 'praxis@example.invalid', patient: null })).toBe('visitor')
    expect(roleFor(patient('approved'))).toBe('approved')
    expect(roleFor(patient('pending'))).toBe('pending')
    expect(roleFor(patient('rejected'))).toBe('pending')
  })

  it('shows server times in Europe/Berlin across daylight saving time', () => {
    expect(berlinTime('2026-11-02T08:00:00Z')).toBe('09:00')
    expect(berlinTime('2027-06-07T07:00:00Z')).toBe('09:00')
    expect(berlinDate('2026-10-25T23:30:00Z')).toBe('2026-10-26')
  })
})
