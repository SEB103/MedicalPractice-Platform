import { onMounted, ref } from 'vue'
import type { Appointment } from '../types/domain'
import { usePatientService } from '../services/patient-service'
export function useAppointments() {
  const records = ref<Appointment[]>([])
  const loading = ref(false)
  const error = ref('')
  const service = usePatientService()
  async function load() {
    loading.value = true
    error.value = ''
    try {
      records.value = await service.list()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unbekannter Fehler'
    } finally {
      loading.value = false
    }
  }
  onMounted(load)
  return { records, loading, error, load }
}
