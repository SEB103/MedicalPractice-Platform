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
      await ready()
      if (demo.conflictNext) {
        demo.conflictNext = false
        throw new Error(
          'Der gewählte Termin wurde inzwischen vergeben (simulierter Konflikt). Bitte wählen Sie eine andere Uhrzeit.',
        )
      }
      const id = crypto.randomUUID()
      demo.state.appointments = createBooking(demo.state.appointments, input, id, replaceId)
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
