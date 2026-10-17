import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { initialState, parseState, STORAGE_KEY } from '../services/persistence'
import { contentProvider } from '../services/content'
import type { PracticeTheme } from '../types/domain'
import { contentByTheme } from '../mocks/content'
import { practices } from '../mocks/practice'
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
    day: string | null
    time: string
    step: number
  } | null>(null)
  const practice = computed(() => practices[state.value.theme])
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
  const profile = computed(() => ({
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
    storageAvailable,
    failNext,
    conflictNext,
    persist,
    reset,
  }
})
