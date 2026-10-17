import { defineBoot } from '#q-app'
import { watch } from 'vue'
import { Dark, setCssVar } from 'quasar'
import { useDemoStore } from '../stores/demo'
import { useAppearanceStore } from '../stores/appearance'
import { customTokens, paletteTheme, standardPrimary } from '../services/appearance'
export default defineBoot(({ store }) => {
  const demo = useDemoStore(store)
  const appearance = useAppearanceStore(store)
  watch(
    () => demo.state.theme,
    (theme) => {
      void demo.loadPublicContent(theme)
    },
    { immediate: true },
  )
  watch(
    () => demo.state.mode,
    (mode) => Dark.set(mode === 'system' ? 'auto' : mode === 'dark'),
    { immediate: true },
  )
  watch(
    () => [appearance.config.palette, appearance.config.customPrimary, Dark.isActive],
    () => {
      const { palette, customPrimary } = appearance.config
      document.documentElement.dataset.palette = paletteTheme[palette]
      const body = document.body
      for (const key of ['surface', 'card', 'hero', 'ink', 'muted', 'line', 'primary-on'])
        body.style.removeProperty('--' + key)
      if (palette === 'custom') {
        const tokens = customTokens(customPrimary, Dark.isActive)
        for (const [key, value] of Object.entries(tokens)) body.style.setProperty('--' + key, value)
        setCssVar('primary', tokens.primary)
      } else setCssVar('primary', standardPrimary[palette][Dark.isActive ? 1 : 0]!)
    },
    { immediate: true },
  )
  watch(
    () => demo.state,
    () => demo.persist(),
    { deep: true },
  )
})
