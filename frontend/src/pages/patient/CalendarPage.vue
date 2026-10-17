<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useDemoStore } from '../../stores/demo'
import { usePatientService } from '../../services/patient-service'
import {
  berlinToday,
  firstAvailableDate,
  formatDate,
  slotsFor,
  canChange,
} from '../../services/appointments'
import { scheduleFor, closureReason, timeLabel, minutes } from '../../services/schedule'
import { practiceContact } from '../../services/practice-config'
import { useClock } from '../../composables/useClock'
import PageHeading from '../../components/PageHeading.vue'
import StatusChip from '../../components/StatusChip.vue'
const demo = useDemoStore()
const route = useRoute()
const router = useRouter()
const api = usePatientService()
const $q = useQuasar()
const now = useClock()
const today = computed(() => berlinToday(now.value))
const busy = ref(false)
const error = ref('')
const replaceId = computed(() =>
  demo.state.role === 'approved' && typeof route.query.replace === 'string'
    ? route.query.replace
    : undefined,
)
const original = computed(() => demo.state.appointments.find((a) => a.id === replaceId.value))
const invalidReplacement = computed(
  () => !!replaceId.value && (!original.value || !canChange(original.value, today.value)),
)
const choices = computed(() => {
  const options = demo.practice.services.map((s) => ({
    label: s.title,
    value: s.id,
    duration: s.durationMinutes,
  }))
  if (
    original.value &&
    !options.some(
      (s) => s.value === original.value?.serviceId && s.label === original.value?.service,
    )
  )
    options.push({
      label: original.value.service,
      value: 'legacy:' + original.value.id,
      duration: original.value.durationMinutes ?? 30,
    })
  return options
})
const savedDraft =
  !route.query.replace &&
  !route.query.service &&
  demo.bookingDraft?.practiceProfile === demo.state.theme &&
  choices.value.some((s) => s.value === demo.bookingDraft?.serviceId)
    ? demo.bookingDraft
    : null
const step = ref(savedDraft?.step ?? 1)
const selectedServiceId = ref(
  original.value
    ? (choices.value.find(
        (s) => s.value === original.value?.serviceId && s.label === original.value?.service,
      )?.value ?? 'legacy:' + original.value.id)
    : (choices.value.find((s) => s.value === route.query.service)?.value ??
        savedDraft?.serviceId ??
        choices.value[0]?.value ??
        ''),
)
const selection = computed(() => choices.value.find((s) => s.value === selectedServiceId.value))
const service = computed(() => selection.value?.label ?? '')
const duration = computed(() => selection.value?.duration ?? 30)
const day = ref<string | null>(
  savedDraft?.day ?? firstAvailableDate(demo.state.appointments, duration.value),
)
const time = ref(savedDraft?.time ?? '')
const schedule = computed(() => scheduleFor(today.value))
const available = computed(() =>
  Object.fromEntries(
    Array.from({ length: schedule.value.horizonDays }, (_, i) => {
      const d = new Date(today.value + 'T12:00:00Z')
      d.setUTCDate(d.getUTCDate() + i + 1)
      const date = d.toISOString().slice(0, 10)
      return [
        date,
        slotsFor(
          date,
          demo.state.appointments,
          today.value,
          duration.value,
          schedule.value,
          replaceId.value,
        ).filter((t) => !(original.value?.date === date && original.value.time === t)),
      ]
    }),
  ),
)
const slots = computed(() => (day.value ? (available.value[day.value] ?? []) : []))
function dateAllowed(value: string) {
  return !!available.value[value.replaceAll('/', '-')]?.length
}
const dayMessage = computed(() =>
  day.value
    ? closureReason(day.value, schedule.value) ||
      'Keine buchbaren Zeiten für die gewählte Terminart.'
    : 'Bitte wählen Sie einen verfügbaren Tag.',
)
watch(
  available,
  () => {
    if (!day.value || !dateAllowed(day.value))
      day.value = Object.keys(available.value).find((d) => available.value[d]!.length > 0) ?? null
    if (!slots.value.includes(time.value)) {
      time.value = ''
      if (step.value === 3) step.value = 2
    }
  },
  { immediate: true },
)
watch(service, () => {
  time.value = ''
})
const dayAppointments = computed(() =>
  demo.state.role === 'approved'
    ? demo.state.appointments.filter((a) => a.date === day.value && a.status !== 'cancelled')
    : [],
)
const events = computed(() =>
  demo.state.appointments
    .filter((a) => demo.state.role === 'approved' && a.status !== 'cancelled')
    .map((a) => a.date.replaceAll('-', '/')),
)
watch(day, () => {
  time.value = ''
  error.value = ''
})
watch(
  () => demo.state.theme,
  () => {
    selectedServiceId.value = choices.value[0]?.value ?? ''
    step.value = 1
    demo.bookingDraft = null
  },
)
const nearestDates = computed(() =>
  Object.keys(available.value)
    .filter((d) => available.value[d]!.length > 0)
    .slice(0, 5),
)
watch([selectedServiceId, day, time, step], () => {
  if (!replaceId.value)
    demo.bookingDraft = {
      service: service.value,
      serviceId: selectedServiceId.value,
      practiceProfile: demo.state.theme,
      day: day.value,
      time: time.value,
      step: step.value,
    }
})
async function submit() {
  if (
    !day.value ||
    !slots.value.includes(time.value) ||
    !selection.value ||
    invalidReplacement.value
  )
    return
  busy.value = true
  error.value = ''
  try {
    const result = await api.book(
      {
        date: day.value,
        time: time.value,
        service: service.value,
        serviceId: selectedServiceId.value.startsWith('legacy:')
          ? undefined
          : selectedServiceId.value,
        practiceProfile: demo.state.theme,
      },
      replaceId.value,
    )
    $q.notify({
      type: 'positive',
      message: replaceId.value
        ? 'Termin verschoben. Neue Anfrage gespeichert.'
        : 'Ihre Demo-Terminanfrage wurde gespeichert.',
    })
    demo.bookingDraft = null
    await router.push('/patient/details/' + result.id)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Anfrage fehlgeschlagen'
    if (!slots.value.includes(time.value) || error.value.includes('Konflikt')) {
      time.value = ''
      step.value = 2
    }
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <q-page class="page-space">
    <div class="content-width">
      <PageHeading
        :title="replaceId ? 'Termin verschieben' : 'Kalender & Terminbuchung'"
        description="Wählen Sie Ihren Wunschtermin. Alle Zeiten gelten für Europe/Berlin."
      />
      <q-banner v-if="invalidReplacement" class="q-mb-lg" role="alert">
        Dieser Termin kann nicht verschoben werden.
        <q-btn flat no-caps to="/patient/appointments" label="Zur Terminübersicht" />
      </q-banner>
      <template v-else>
        <q-banner v-if="original" rounded class="q-mb-lg">
          Bisher: {{ formatDate(original.date) }} · {{ original.time }} Uhr. Der bisherige Termin
          bleibt bestehen, bis die neue Anfrage erfolgreich gespeichert wurde (Demoannahme).
        </q-banner>
        <q-stepper
          v-model="step"
          flat
          bordered
          color="primary"
          :contracted="$q.screen.lt.sm"
          :vertical="$q.screen.lt.sm"
        >
          <q-step :name="1" title="Terminart" icon="medical_services" :done="step > 1">
            <h2 class="text-h6">Worum geht es bei Ihrem Besuch?</h2>
            <q-select
              v-model="selectedServiceId"
              outlined
              emit-value
              map-options
              :options="choices"
              label="Terminart"
            />
            <p class="muted q-mt-md">
              Dauer: {{ duration }} Minuten · Dr. Anna Linden · Vor Ort in der Praxis
            </p>
            <q-banner rounded class="q-mt-md">
              Urlaub: {{ formatDate(schedule.absences[0]!.from) }} –
              {{ formatDate(schedule.absences[0]!.to) }}. Danach am
              {{ formatDate(Object.keys(schedule.overrides)[0]!) }} verkürzte Sprechzeit.
              Demokalender mit Pausen und 10 Minuten Abstand zwischen Besuchen.
            </q-banner>
            <q-stepper-navigation>
              <q-btn
                color="primary"
                unelevated
                no-caps
                label="Datum auswählen"
                :disable="!service"
                @click="step = 2"
              />
            </q-stepper-navigation>
          </q-step>
          <q-step :name="2" title="Datum & Uhrzeit" icon="calendar_month" :done="step > 2">
            <h2 class="text-h6">Nächste freie Tage</h2>
            <div class="row q-gutter-sm q-mb-lg" aria-label="Nächste freie Tage">
              <q-btn
                v-for="date in nearestDates"
                :key="date"
                :outline="day !== date"
                :unelevated="day === date"
                color="primary"
                no-caps
                :label="formatDate(date)"
                :aria-pressed="day === date"
                @click="day = date"
              />
              <p v-if="!nearestDates.length" role="status">
                Zurzeit sind keine freien Termine verfügbar. Bitte wenden Sie sich an die Praxis.
              </p>
            </div>
            <div class="row q-col-gutter-xl">
              <div class="col-12 col-md-auto">
                <q-date
                  v-model="day"
                  class="booking-calendar"
                  mask="YYYY-MM-DD"
                  :events="events"
                  :options="dateAllowed"
                  event-color="orange"
                  :first-day-of-week="1"
                  minimal
                  flat
                  bordered
                />
                <p class="text-caption muted q-mt-sm">
                  Markierte Tage: eigene Demo-Termine.
                  <br />
                  Buchbar: Werktage ab morgen, bis 90 Tage im Voraus. Ausgegraut: keine passenden
                  freien Zeiten.
                </p>
              </div>
              <div class="col-12 col-md">
                <h2 class="text-h6">{{ day ? formatDate(day) : 'Bitte einen Tag auswählen' }}</h2>
                <div v-if="slots.length" class="slot-grid">
                  <q-btn
                    v-for="slot in slots"
                    :key="slot"
                    :outline="time !== slot"
                    :unelevated="time === slot"
                    color="primary"
                    :label="`${slot}–${timeLabel(minutes(slot) + duration)}`"
                    :aria-pressed="time === slot"
                    @click="time = slot"
                  />
                </div>
                <q-banner v-else rounded>
                  {{ dayMessage }} Bitte wählen Sie einen anderen Tag.
                </q-banner>
                <div v-if="dayAppointments.length" class="q-mt-xl">
                  <h3 class="text-subtitle1">Ihre Termine an diesem Tag</h3>
                  <q-list bordered separator>
                    <q-item
                      v-for="item in dayAppointments"
                      :key="item.id"
                      clickable
                      :to="'/patient/details/' + item.id"
                    >
                      <q-item-section>{{ item.time }} Uhr · {{ item.service }}</q-item-section>
                      <q-item-section side><StatusChip :status="item.status" /></q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </div>
            <q-stepper-navigation class="q-gutter-sm">
              <q-btn
                color="primary"
                unelevated
                no-caps
                label="Anfrage prüfen"
                :disable="!time || !day"
                @click="step = 3"
              />
              <q-btn flat no-caps label="Zurück" @click="step = 1" />
            </q-stepper-navigation>
          </q-step>
          <q-step :name="3" title="Anfrage prüfen" icon="check">
            <h2 class="text-h6">Ihre Terminanfrage im Überblick</h2>
            <q-list bordered separator>
              <q-item>
                <q-item-section>Terminart</q-item-section>
                <q-item-section>{{ service }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section>Datum & Uhrzeit</q-item-section>
                <q-item-section>{{ day ? formatDate(day) : '' }} · {{ time }} Uhr</q-item-section>
              </q-item>
              <q-item>
                <q-item-section>Patient</q-item-section>
                <q-item-section>
                  {{ demo.state.role === 'approved' ? 'Max Mustermann · Demo' : 'Nach Anmeldung' }}
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>Ort & Dauer</q-item-section>
                <q-item-section>
                  {{ practiceContact.locationLabel }} · {{ duration }} Minuten
                  <br />
                  {{ practiceContact.address }}
                </q-item-section>
              </q-item>
            </q-list>
            <p class="muted q-mt-lg">
              Demoannahme: Für eine Anfrage ist ein freigegebener Demoaccount erforderlich. Die neue
              Anfrage wird als „Termin angefragt“ gespeichert und ist noch nicht bestätigt. In
              dieser Demo wird nichts an die Praxis gesendet.
            </p>
            <q-stepper-navigation class="q-gutter-sm">
              <q-btn
                color="primary"
                unelevated
                no-caps
                v-if="demo.state.role === 'approved'"
                :label="replaceId ? 'Neue Zeit anfragen' : 'Demo-Termin anfragen'"
                :loading="busy"
                :disable="!selection || !day || !slots.includes(time)"
                @click="submit"
              />
              <q-btn
                v-else
                color="primary"
                unelevated
                no-caps
                :to="
                  demo.state.role === 'pending' ? '/freigabe' : '/anmelden?next=/patient/calendar'
                "
                :label="
                  demo.state.role === 'pending'
                    ? 'Freigabe ausstehend'
                    : 'Anmelden und Anfrage fortsetzen'
                "
              />
              <q-btn flat no-caps label="Zurück" :disable="busy" @click="step = 2" />
            </q-stepper-navigation>
          </q-step>
        </q-stepper>
        <q-banner v-if="error" rounded role="alert" class="q-mt-lg">
          <template #avatar><q-icon name="error_outline" color="negative" /></template>
          {{ error }}
        </q-banner>
        <q-btn
          v-if="replaceId"
          flat
          no-caps
          :disable="busy"
          :to="'/patient/details/' + replaceId"
          label="Verschiebung abbrechen"
          class="q-mt-md"
        />
      </template>
    </div>
  </q-page>
</template>
