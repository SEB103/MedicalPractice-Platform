import { serviceById } from './service-catalog'
import type { PatientService } from '../types/domain'
import { useDemoStore } from '../stores/demo'
import { cancelBooking, createBooking } from './appointments'
export function usePatientService(): PatientService {
  const demo = useDemoStore()
  async function ready() {
    await new Promise((resolve) => setTimeout(resolve, 250))
    if (demo.state.role !== 'approved')
      throw new Error('Bitte melden Sie sich als freigegebener Demopatient an.')
    if (demo.failNext) {
      demo.failNext = false
      throw new Error('Simulierter Verbindungsfehler. Bitte versuchen Sie es erneut.')
    }
  }
  return {
    async list() {
      await ready()
      return demo.state.appointments.map((item) => ({ ...item }))
    },
    async book(input, replaceId) {
      const profile = demo.state.theme
      await ready()
      if (
        profile !== demo.state.theme ||
        (input.practiceProfile && input.practiceProfile !== profile)
      )
        throw new Error('Das Praxisprofil wurde geändert. Bitte wählen Sie Ihre Terminart erneut.')
      const original = replaceId
        ? demo.state.appointments.find((a) => a.id === replaceId)
        : undefined
      const selected = input.serviceId
        ? serviceById(profile, input.serviceId)
        : demo.practice.services.find((s) => s.title === input.service)
      const legacy = !input.serviceId && original?.service === input.service
      if (!selected && !legacy)
        throw new Error('Diese Terminart gehört nicht zum aktuellen Praxisprofil.')
      const normalized = selected
        ? { ...input, serviceId: selected.id, service: selected.title, practiceProfile: profile }
        : input
      if (demo.conflictNext) {
        demo.conflictNext = false
        throw new Error(
          'Der gewählte Termin wurde inzwischen vergeben (simulierter Konflikt). Bitte wählen Sie eine andere Uhrzeit.',
        )
      }
      const id = crypto.randomUUID()
      demo.state.appointments = createBooking(demo.state.appointments, normalized, id, replaceId)
      demo.persist()
      return demo.state.appointments.find((item) => item.id === id)!
    },
    async cancel(id) {
      await ready()
      demo.state.appointments = cancelBooking(demo.state.appointments, id)
      demo.persist()
    },
  }
}
