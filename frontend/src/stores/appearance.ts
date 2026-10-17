import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { defaults, parseAppearance } from '../services/appearance'
import { useDemoStore } from './demo'
export const APPEARANCE_KEY = 'medicalpractice-appearance-v1'
export const useAppearanceStore = defineStore('appearance', () => {
  const demo = useDemoStore()
  let raw: string | null = null
  try {
    raw = localStorage.getItem(APPEARANCE_KEY)
  } catch {
    /* Optional demo storage. */
  }
  const config = ref(parseAppearance(raw, demo.state.theme))
  const storageAvailable = ref(true)
  watch(
    config,
    () => {
      try {
        localStorage.setItem(APPEARANCE_KEY, JSON.stringify(config.value))
        storageAvailable.value = true
      } catch {
        storageAvailable.value = false
      }
    },
    { deep: true, immediate: true },
  )
  function reset() {
    config.value = defaults()
  }
  return { config, storageAvailable, reset }
})
