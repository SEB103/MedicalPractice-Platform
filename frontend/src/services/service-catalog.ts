import { practices } from '../mocks/practice'
import type { PracticeTheme } from '../types/domain'
export function serviceById(profile: PracticeTheme, id?: string) {
  return practices[profile].services.find((s) => s.id === id)
}
export function serviceFromRoute(profile: PracticeTheme, id: string) {
  return (
    serviceById(profile, id) ??
    (/^\d+$/.test(id) ? practices[profile].services[Number(id)] : undefined)
  )
}
