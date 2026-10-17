import { weeklyHours, describeHours } from './practice-hours'
export interface PracticeContact {
  locationLabel: string
  address: string
  addressVerified: boolean
  placeId?: string
  phone: string | null
  phoneNotice?: string
  email: string
  consultationHours: [string, string][]
  telephoneHours: string
}
export const practiceContact: PracticeContact = {
  locationLabel: 'Rathaus Göppingen · Demostandort, keine Arztpraxis',
  address: 'Hauptstraße 1, 73033 Göppingen, Deutschland',
  addressVerified: true,
  // Reserved fictional number: Bundesnetzagentur Drama Numbers.
  phone: '+49 (0)30 23125 000',
  phoneNotice: 'Demo-Telefonnummer · nicht erreichbar, kein Praxisanschluss.',
  email: 'praxis@example.invalid',
  consultationHours: describeHours(weeklyHours),
  telephoneHours: 'Montag bis Freitag · 09:00–11:00 (Demo)',
}
export function mapLinks(config: PracticeContact) {
  if (!config.addressVerified || !config.address.trim()) return null
  const search = new URLSearchParams({ api: '1', query: config.address })
  const route = new URLSearchParams({ api: '1', destination: config.address })
  if (config.placeId) {
    search.set('query_place_id', config.placeId)
    route.set('destination_place_id', config.placeId)
  }
  return {
    map: 'https://www.google.com/maps/search/?' + search,
    route: 'https://www.google.com/maps/dir/?' + route,
  }
}
export function phoneLink(phone: string | null) {
  return phone && /^\+?[\d ()-]+$/.test(phone)
    ? 'tel:' + phone.replace(/^(\+\d{1,3})\s*\(0\)/, '$1').replace(/[^+\d]/g, '')
    : undefined
}
export interface PracticeConfigApi {
  getContact(): Promise<PracticeContact>
}
