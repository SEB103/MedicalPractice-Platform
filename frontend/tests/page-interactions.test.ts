// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { shallowMount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, nextTick } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import OwnerPage from '../src/pages/demo/OwnerPage.vue'
import CalendarPage from '../src/pages/patient/CalendarPage.vue'
import LoginPage from '../src/pages/auth/LoginPage.vue'
import { useDemoStore } from '../src/stores/demo'
import { parseAppearance } from '../src/services/appearance'
import { useAppearanceStore, APPEARANCE_KEY } from '../src/stores/appearance'

vi.mock('quasar', () => ({ useQuasar: () => ({ screen: { lt: { sm: false } }, notify: vi.fn() }) }))
// Native controls exercise page bindings and transitions; Quasar layout is not browser-tested here.
const button = defineComponent({
  props: ['label', 'disable', 'to'],
  template: '<button :disabled="disable">{{ label }}</button>',
})
const select = defineComponent({
  props: ['modelValue', 'options'],
  emits: ['update:modelValue'],
  template:
    '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option></select>',
})
const input = defineComponent({
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template:
    '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
})
let wrappers: VueWrapper[] = []
let pinia: ReturnType<typeof createPinia>
let router: ReturnType<typeof createRouter>
beforeEach(async () => {
  localStorage.clear()
  pinia = createPinia()
  setActivePinia(pinia)
  router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
  })
  await router.push('/patient/calendar')
  await router.isReady()
})
afterEach(() => {
  wrappers.forEach((w) => w.unmount())
  wrappers = []
})
function page(component: typeof CalendarPage | typeof OwnerPage | typeof LoginPage) {
  const w = shallowMount(component, {
    global: {
      plugins: [pinia, router],
      renderStubDefaultSlot: true,
      mocks: { $q: { screen: { lt: { sm: false } } } },
      stubs: {
        QBtn: button,
        QSelect: select,
        QInput: input,
        DemoToolbar: true,
        ...Object.fromEntries(
          [
            'QPage',
            'QBanner',
            'QColor',
            'QSeparator',
            'QStepper',
            'QStep',
            'QStepperNavigation',
            'QDate',
            'QList',
            'QItem',
            'QItemSection',
            'QIcon',
            'QCard',
            'QCardSection',
          ].map((n) => [n, true]),
        ),
      },
    },
  })
  wrappers.push(w)
  return w
}
function btn(w: VueWrapper, label: string) {
  return w.findAll('button').find((b) => b.text() === label)!
}
it('allows standard palette after invalid HEX, then persists and resets', async () => {
  const w = page(OwnerPage)
  await w.get('select').setValue('custom')
  await w.get('input').setValue('bad')
  expect(btn(w, 'Farben anwenden').attributes('disabled')).toBeDefined()
  await w.get('select').setValue('pflaume')
  expect(w.find('input').exists()).toBe(false)
  expect(btn(w, 'Farben anwenden').attributes('disabled')).toBeUndefined()
  await btn(w, 'Farben anwenden').trigger('click')
  expect(useAppearanceStore().config.palette).toBe('pflaume')
  expect(parseAppearance(localStorage.getItem(APPEARANCE_KEY)).palette).toBe('pflaume')
  await btn(w, 'Standardfarben wiederherstellen').trigger('click')
  expect(useAppearanceStore().config.palette).toBe('waldgruen')
})
it('retains date and time across login and submits a pending request', async () => {
  const demo = useDemoStore()
  let w = page(CalendarPage)
  await btn(w, 'Datum auswählen').trigger('click')
  await w.get('.slot-grid button').trigger('click')
  await btn(w, 'Anfrage prüfen').trigger('click')
  const draft = { ...demo.bookingDraft! }
  expect(draft.time).toBeTruthy()
  expect(draft.step).toBe(3)
  w.unmount()
  await router.push('/anmelden?next=/patient/calendar')
  const login = page(LoginPage)
  await btn(login, 'Als Demopatient anmelden').trigger('click')
  await flushPromises()
  expect(router.currentRoute.value.path).toBe('/patient/calendar')
  login.unmount()
  w = page(CalendarPage)
  expect(w.text()).toContain(draft.time + ' Uhr')
  await btn(w, 'Demo-Termin anfragen').trigger('click')
  await new Promise((r) => setTimeout(r, 300))
  await flushPromises()
  const result = demo.state.appointments.at(-1)!
  expect(result).toMatchObject({
    date: draft.day,
    time: draft.time,
    serviceId: draft.serviceId,
    status: 'pending',
  })
  expect(demo.bookingDraft).toBeNull()
  expect(router.currentRoute.value.path).toBe('/patient/details/' + result.id)
})
it('discards another profile draft but preserves it when only color changes', async () => {
  const demo = useDemoStore()
  let w = page(CalendarPage)
  await btn(w, 'Datum auswählen').trigger('click')
  await w.get('.slot-grid button').trigger('click')
  const draft = { ...demo.bookingDraft! }
  w.unmount()
  useAppearanceStore().config.palette = 'pflaume'
  await nextTick()
  w = page(CalendarPage)
  expect(demo.bookingDraft?.time).toBe(draft.time)
  w.unmount()
  demo.state.theme = 'psychiatry'
  await nextTick()
  w = page(CalendarPage)
  expect(w.text()).not.toContain(draft.service)
  expect(w.get('select').element.value).toBe(demo.practice.services[0]!.id)
  expect(w.findAll('.slot-grid button[aria-pressed="true"]')).toHaveLength(0)
})
