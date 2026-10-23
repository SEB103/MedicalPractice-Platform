import { defineBoot } from '#q-app'
import { apiMode } from '../config/api'
import { useDemoStore } from '../stores/demo'
import { useAppearanceStore } from '../stores/appearance'
import type { Palette } from '../services/appearance'

// Real API mode: restore the session and load services/hours before the first route guard runs.
export default defineBoot(async ({ store }) => {
  if (!apiMode) return
  const demo = useDemoStore(store)
  demo.state.appointments = []
  await Promise.allSettled([demo.refreshMe(), demo.loadPractice()])
  await demo.loadContent().catch(() => undefined)
  // The practice's colour palette comes from the CMS; visitors cannot change it.
  const appearance = demo.apiContent?.appearance
  if (appearance)
    useAppearanceStore(store).config = {
      version: 1,
      palette: appearance.palette as Palette,
      customPrimary: appearance.custom_primary,
    }
})
