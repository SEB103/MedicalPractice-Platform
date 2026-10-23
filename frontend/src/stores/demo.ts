import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { initialState, parseState, STORAGE_KEY } from '../services/persistence'
import { contentProvider } from '../services/content'
import type { PracticeTheme } from '../types/domain'
import { contentByTheme } from '../mocks/content'
import { practices } from '../mocks/practice'
import { apiMode } from '../config/api'
import {
  authApi,
  practiceApi,
  roleFor,
  type AvailabilityMap,
  type MeDto,
  type ScheduleDto,
  type ServiceDto,
} from '../services/api'
export const useDemoStore = defineStore('demo', () => {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    /* Storage may be disabled. */
  }
  const state = ref(parseState(raw))
  const storageAvailable = ref(true)
  const failNext = ref(false)
  const conflictNext = ref(false)
  const bookingDraft = ref<{
    service: string
    serviceId: string
    practiceProfile: PracticeTheme
    day: string | null
    time: string
    step: number
  } | null>(null)
  // Real-API state (MEDICALPRACTICE_API=http); unused in the static mock demo.
  const me = ref<MeDto | null>(null)
  const apiServices = ref<ServiceDto[] | null>(null)
  const schedule = ref<ScheduleDto | null>(null)
  const availability = ref<Record<string, AvailabilityMap>>({})
  const practice = computed(() => {
    const base = practices[state.value.theme]
    if (!apiMode || !apiServices.value) return base
    return {
      ...base,
      services: apiServices.value.map((s) => ({
        id: String(s.id),
        title: s.title,
        icon: s.icon || 'event',
        description: s.description,
        durationMinutes: s.duration_minutes,
      })),
    }
  })
  async function refreshMe() {
    me.value = await authApi.me()
    state.value.role = roleFor(me.value)
  }
  async function loadPractice() {
    const [services, hours] = await Promise.all([practiceApi.services(), practiceApi.schedule()])
    apiServices.value = services
    schedule.value = hours
  }
  async function loadAvailability(serviceId: string) {
    availability.value = { ...availability.value, [serviceId]: await practiceApi.availability(serviceId) }
  }
  const publicContent = ref({ ...contentByTheme })
  const publicContentError = ref('')
  const content = computed(() => publicContent.value[state.value.theme])
  async function loadPublicContent(theme: PracticeTheme) {
    publicContentError.value = ''
    try {
      publicContent.value[theme] = await contentProvider.get(theme)
    } catch {
      if (state.value.theme === theme)
        publicContentError.value =
          'Aktuelle Praxisinformationen konnten nicht geladen werden. Die Vorschau zeigt lokale Beispielinhalte.'
    }
  }
  const profile = computed(() => {
    const patient = me.value?.patient
    if (apiMode && me.value)
      return {
        name: patient ? `${patient.first_name} ${patient.last_name}` : me.value.email,
        email: me.value.email,
        address: patient
          ? [patient.street, [patient.postal_code, patient.city].filter(Boolean).join(' ')]
              .filter(Boolean)
              .join(', ')
          : '',
      }
    return demoProfile.value
  })
  const demoProfile = computed(() => ({
    name: 'Max Mustermann',
    email: 'max.mustermann@example.invalid',
    address: state.value.alternateAddress
      ? 'Beispielweg 8, 12345 Musterstadt'
      : 'Musterstraße 12, 12345 Musterstadt',
  }))
  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
      storageAvailable.value = true
    } catch {
      storageAvailable.value = false
    }
  }
  function reset() {
    state.value = initialState()
    bookingDraft.value = null
    failNext.value = false
    conflictNext.value = false
    persist()
  }
  return {
    state,
    bookingDraft,
    practice,
    content,
    publicContentError,
    loadPublicContent,
    profile,
    me,
    schedule,
    availability,
    refreshMe,
    loadPractice,
    loadAvailability,
    storageAvailable,
    failNext,
    conflictNext,
    persist,
    reset,
  }
})
