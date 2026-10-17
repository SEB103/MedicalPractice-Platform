<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PageHeading from '../../components/PageHeading.vue'
import StatusChip from '../../components/StatusChip.vue'
import LoadState from '../../components/LoadState.vue'
import { useClock } from '../../composables/useClock'
import { useAppointments } from '../../composables/useAppointments'
import { berlinToday, isUpcoming, formatDate } from '../../services/appointments'
const { records, loading, error, load } = useAppointments()
const now = useClock()
const upcoming = computed(() =>
  records.value
    .filter((a) => isUpcoming(a, now.value))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
)
const next = computed(() => upcoming.value[0])
const calendarDay = ref(berlinToday())
watch(
  next,
  (item) => {
    if (item) calendarDay.value = item.date
  },
  { immediate: true },
)
const calendarEvents = computed(() => upcoming.value.map((a) => a.date.replaceAll('-', '/')))
const selectedAppointments = computed(() =>
  upcoming.value.filter((a) => a.date === calendarDay.value),
)
</script>
<template>
  <q-page class="page-space">
    <div class="content-width">
      <PageHeading
        title="Guten Tag, Max."
        eyebrow="Mein Dashboard"
        description="Schön, dass Sie da sind. Hier behalten Sie Ihre Termine im Blick."
      />
      <LoadState :loading="loading" :error="error" @retry="load">
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-lg-8">
            <q-card flat bordered class="q-pa-lg">
              <div class="row items-center justify-between">
                <h2 class="text-h6 q-mb-none">
                  {{
                    next?.status === 'pending'
                      ? 'Ihre nächste Terminanfrage'
                      : 'Ihr nächster bestätigter Termin'
                  }}
                </h2>
                <q-icon name="event_available" color="primary" size="32px" />
              </div>
              <template v-if="next">
                <p class="text-h4 q-mt-xl q-mb-sm">{{ formatDate(next.date) }}</p>
                <p class="text-h6">
                  {{ next.time }} Uhr · {{ next.durationMinutes ?? 30 }} Minuten
                </p>
                <p class="muted">{{ next.service }} bei Dr. Anna Linden</p>
                <StatusChip :status="next.status" />
                <q-separator class="q-my-lg" />
                <q-btn
                  outline
                  color="primary"
                  no-caps
                  :to="'/patient/details/' + next.id"
                  label="Termindetails ansehen"
                  icon-right="arrow_forward"
                />
              </template>
              <template v-else>
                <q-icon name="event_busy" size="48px" class="q-my-lg muted" />
                <p>Aktuell steht kein Termin an.</p>
                <q-btn color="primary" no-caps to="/patient/calendar" label="Termin anfragen" />
              </template>
            </q-card>
          </div>
          <div class="col-12 col-lg-4">
            <q-card flat class="hero-panel q-pa-lg full-height">
              <q-icon name="add_circle_outline" color="primary" size="40px" />
              <h2 class="text-h5 q-mt-lg">Zeit für Ihren nächsten Schritt.</h2>
              <p class="muted">
                Wählen Sie einen passenden Tag und senden Sie eine Demo-Terminanfrage.
              </p>
              <q-btn
                color="primary"
                unelevated
                no-caps
                to="/patient/calendar"
                label="Termin vereinbaren"
              />
            </q-card>
          </div>
          <div class="col-12">
            <q-card flat bordered>
              <q-card-section>
                <div class="row q-col-gutter-lg">
                  <div class="col-12 col-md-5 dashboard-calendar">
                    <h2 class="text-h6">Ihr Terminkalender</h2>
                    <q-date
                      v-model="calendarDay"
                      mask="YYYY-MM-DD"
                      :events="calendarEvents"
                      event-color="primary"
                      minimal
                      flat
                      :first-day-of-week="1"
                    />
                    <p class="text-caption muted">
                      Markierte Tage: bestätigte Termine und offene Anfragen.
                    </p>
                  </div>
                  <div class="col-12 col-md-7">
                    <h2 class="text-h6">
                      {{ calendarDay ? formatDate(calendarDay) : 'Tag auswählen' }}
                    </h2>
                    <q-list v-if="selectedAppointments.length" separator>
                      <q-item
                        v-for="item in selectedAppointments"
                        :key="item.id"
                        clickable
                        :to="'/patient/details/' + item.id"
                      >
                        <q-item-section>
                          <q-item-label>{{ item.time }} Uhr · {{ item.service }}</q-item-label>
                          <q-item-label caption>
                            {{ item.durationMinutes ?? 30 }} Minuten · Dr. Anna Linden
                          </q-item-label>
                        </q-item-section>
                        <q-item-section side><StatusChip :status="item.status" /></q-item-section>
                      </q-item>
                    </q-list>
                    <p v-else class="muted">
                      An diesem Tag haben Sie keinen bevorstehenden Termin.
                    </p>
                    <q-separator class="q-my-lg" />
                    <h3 class="text-subtitle1 text-weight-medium">Vor Ihrem nächsten Besuch</h3>
                    <p class="muted">
                      Notieren Sie Ihre Fragen. Bei organisatorischen Unsicherheiten helfen die
                      Patienteninformationen weiter.
                    </p>
                    <q-btn
                      flat
                      no-caps
                      color="primary"
                      to="/patienteninformationen"
                      label="Vorbereitung & Hinweise"
                      icon-right="arrow_forward"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6">
            <q-card flat bordered>
              <q-card-section>
                <h2 class="text-h6">Meine Termine</h2>
                <p class="muted">{{ upcoming.length }} bevorstehende Termine und Anfragen</p>
                <q-btn
                  flat
                  no-caps
                  color="primary"
                  to="/patient/appointments"
                  label="Terminübersicht öffnen"
                  icon-right="arrow_forward"
                />
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6">
            <q-card flat bordered>
              <q-card-section>
                <h2 class="text-h6">Mein Profil</h2>
                <p class="muted">Ihre synthetischen Kontaktdaten und Einstellungen</p>
                <q-btn
                  flat
                  no-caps
                  color="primary"
                  to="/patient/profile"
                  label="Profil ansehen"
                  icon-right="arrow_forward"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </LoadState>
    </div>
  </q-page>
</template>
