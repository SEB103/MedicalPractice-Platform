<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { practiceContact } from '../../services/practice-config'
import { useDemoStore } from '../../stores/demo'
import { usePatientService } from '../../services/patient-service'
import { canChange, formatDate } from '../../services/appointments'
import { apiMode } from '../../config/api'
import PageHeading from '../../components/PageHeading.vue'
import StatusChip from '../../components/StatusChip.vue'
const demo = useDemoStore()
const route = useRoute()
const $q = useQuasar()
const api = usePatientService()
const busy = ref(false)
const error = ref('')
const item = computed(() => demo.state.appointments.find((a) => a.id === route.params.id))
function cancel() {
  if (!item.value) return
  const id = item.value.id
  $q.dialog({
    title: 'Termin absagen?',
    message:
      apiMode
        ? 'Der Termin wird abgesagt und die Zeit wieder freigegeben.'
        : 'Die Absage wird in Ihrer Demo-Terminübersicht gespeichert. Es wird keine Nachricht versendet.',
    cancel: { label: 'Termin behalten', flat: true },
    ok: { label: 'Termin absagen', color: 'negative' },
  }).onOk(async () => {
    busy.value = true
    error.value = ''
    try {
      await api.cancel(id)
      $q.notify({ type: 'positive', message: apiMode ? 'Termin abgesagt.' : 'Demo-Termin abgesagt.' })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Absage fehlgeschlagen'
    } finally {
      busy.value = false
    }
  })
}
</script>
<template>
  <q-page class="page-space">
    <div class="content-width">
      <q-btn
        flat
        no-caps
        to="/patient/appointments"
        icon="arrow_back"
        label="Meine Termine"
        class="q-mb-lg"
      />
      <PageHeading title="Termindetails" />
      <q-card v-if="item" flat bordered>
        <q-card-section class="q-pa-lg">
          <div class="row justify-between items-center">
            <h2 class="text-h5 q-mb-none">{{ item.service }}</h2>
            <StatusChip :status="item.status" />
          </div>
          <p class="text-h4 q-mt-xl q-mb-sm">{{ formatDate(item.date) }}</p>
          <p class="text-h6">{{ item.time }} Uhr · {{ item.durationMinutes ?? 30 }} Minuten</p>
          <p class="muted">
            Dr. Anna Linden · Praxis Linden
            <br />
            {{ practiceContact.locationLabel }}
            <br />
            {{ practiceContact.address }}
          </p>
          <q-banner v-if="item.note" rounded class="q-my-lg" role="status">
            Hinweis der Praxis: {{ item.note }}
          </q-banner>
          <q-banner v-if="item.status === 'pending' && apiMode" rounded class="q-my-lg">
            Ihre Anfrage wartet auf Bestätigung durch die Praxis.
          </q-banner>
          <q-banner v-else-if="item.status === 'pending'" rounded class="q-my-lg">
            Ihre Anfrage wartet auf Bestätigung. Diese Demo enthält keine echte Praxisfreigabe für
            Termine.
          </q-banner>
          <q-separator class="q-my-lg" />
          <div v-if="canChange(item)" class="row q-gutter-sm">
            <q-btn
              color="primary"
              unelevated
              no-caps
              label="Termin verschieben"
              :disable="busy"
              :to="{ path: '/patient/calendar', query: { replace: item.id } }"
            />
            <q-btn
              outline
              color="negative"
              no-caps
              label="Termin absagen"
              :loading="busy"
              @click="cancel"
            />
          </div>
          <p v-else class="muted">Für diesen Termin sind keine Änderungen mehr möglich.</p>
          <q-banner v-if="error" role="alert" class="q-mt-lg">{{ error }}</q-banner>
        </q-card-section>
      </q-card>
      <q-banner v-else>
        Dieser Termin wurde nicht gefunden oder die Demo wurde zurückgesetzt.
      </q-banner>
    </div>
  </q-page>
</template>
