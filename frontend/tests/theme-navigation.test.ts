// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { Quasar, QBtn, QSelect, QSeparator, ClosePopup } from 'quasar'
import ThemeControls from '../src/components/ThemeControls.vue'

it('opens palette settings from the shared appearance menu in the demo build', async () => {
  localStorage.clear()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/demo/erscheinungsbild', component: { template: '<div />' } },
    ],
  })
  await router.push('/')
  await router.isReady()
  const wrapper = mount(ThemeControls, {
    global: {
      plugins: [createPinia(), router, [Quasar, { components: { QBtn, QSelect, QSeparator }, directives: { ClosePopup } }]],
    },
  })
  try {
    expect(wrapper.text()).toContain('Darstellung')
    const link = wrapper.get('a[href="/demo/erscheinungsbild"]')
    expect(link.text()).toContain('Demo: Farben & Einstellungen')
    await link.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/demo/erscheinungsbild')
  } finally {
    wrapper.unmount()
  }
})
