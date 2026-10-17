export interface PracticeContact {
  locationLabel: string
  address: string
  addressVerified: boolean
  placeId?: string
  phone: string | null
  email: string
  consultationHours: [string, string][]
  telephoneHours: string
}
export const practiceContact: PracticeContact = {
  locationLabel: 'Rathaus Göppingen · Demostandort, keine Arztpraxis',
  address: 'Hauptstraße 1, 73033 Göppingen, Deutschland',
  addressVerified: true,
  phone: null,
  email: 'praxis@example.invalid',
  consultationHours: [
    ['Montag / Dienstag / Donnerstag', '09:00–12:00 · 14:00–17:00'],
    ['Mittwoch', '09:00–11:00 · 14:00–16:00'],
    ['Freitag', '09:00–12:00'],
    ['Samstag / Sonntag', 'Geschlossen'],
  ],
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
  return phone && /^\+?[\d ()-]+$/.test(phone) ? 'tel:' + phone.replace(/[^+\d]/g, '') : undefined
}
export interface PracticeConfigApi {
  getContact(): Promise<PracticeContact>
}
