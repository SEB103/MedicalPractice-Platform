import { defineBoot } from '#q-app'
import { apiMode } from '../config/api'
import { useDemoStore } from '../stores/demo'

// Real API mode: restore the session and load services/hours before the first route guard runs.
export default defineBoot(async ({ store }) => {
  if (!apiMode) return
  const demo = useDemoStore(store)
  demo.state.appointments = []
  await Promise.allSettled([demo.refreshMe(), demo.loadPractice()])
})
