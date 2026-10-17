import { defineRouter } from '#q-app'
import { createRouter, createWebHashHistory } from 'vue-router'
import { nextTick } from 'vue'
import routes from './routes'
import { protectedRedirect } from './guard'
import { useDemoStore } from '../stores/demo'
export default defineRouter(({ store }) => {
  const router = createRouter({
    history: createWebHashHistory(),
    routes,
    scrollBehavior: () => ({ top: 0 }),
  })
  router.beforeEach((to) => {
    const redirect = protectedRedirect(to.path, useDemoStore(store).state.role)
    if (redirect) return { path: redirect, query: { next: to.fullPath } }
  })
  router.afterEach(async (to) => {
    document.title = `${String(to.meta.title || 'Praxis Linden')} · Praxis Linden`
    await nextTick()
    const heading = document.querySelector<HTMLElement>('h1')
    if (heading) {
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }
  })
  return router
})
