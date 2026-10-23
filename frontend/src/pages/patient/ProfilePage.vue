<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { apiMode } from '../../config/api'
import { authApi } from '../../services/api'
import { formatDate } from '../../services/appointments'
import { useDemoStore } from '../../stores/demo'
import PageHeading from '../../components/PageHeading.vue'
const demo = useDemoStore()
const $q = useQuasar()
const editing = ref(false)
const alternate = ref(demo.state.alternateAddress)
const busy = ref(false)
const error = ref('')
const patient = computed(() => demo.me?.patient ?? null)
const contact = reactive({ phone: '', street: '', postal_code: '', city: '' })
const initials = computed(() =>
  demo.profile.name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)
async function save() {
  if (!apiMode) {
    demo.state.alternateAddress = alternate.value
    editing.value = false
    $q.notify({ type: 'positive', message: 'Demo-Profil gespeichert.' })
    return
  }
  busy.value = true
  error.value = ''
  try {
    demo.me = await authApi.updateContact({ ...contact })
    editing.value = false
    $q.notify({ type: 'positive', message: 'Profil gespeichert.' })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Speichern fehlgeschlagen.'
  } finally {
    busy.value = false
  }
}
function edit() {
  alternate.value = demo.state.alternateAddress
  if (patient.value)
    Object.assign(contact, {
      phone: patient.value.phone,
      street: patient.value.street,
      postal_code: patient.value.postal_code,
      city: patient.value.city,
    })
  editing.value = true
}
</script>
<template>
  <q-page class="page-space">
    <div class="content-width">
      <PageHeading
        title="Mein Profil"
        :description="
          apiMode
            ? 'Ihre bei der Praxis hinterlegten Angaben.'
            : 'Ihr freigegebener Demoaccount. Bitte keine echten Personendaten eingeben.'
        "
      />
      <q-banner v-if="patient?.account_linked" rounded class="q-mb-lg" role="status">
        Ihr Konto wurde mit Ihren Patientendaten verbunden.
      </q-banner>
      <q-card flat bordered>
        <q-card-section class="q-pa-lg">
          <div class="row items-center q-gutter-md q-mb-xl">
            <q-avatar color="primary" text-color="white" size="64px">{{ initials }}</q-avatar>
            <div>
              <h2 class="text-h6 q-mb-xs">{{ demo.profile.name }}</h2>
              <q-chip dense outline color="primary">
                {{ apiMode ? 'Freigegeben' : 'Freigegeben · Demoaccount' }}
              </q-chip>
            </div>
          </div>
          <q-form class="q-gutter-lg" @submit="save">
            <q-input outlined readonly :model-value="demo.profile.name" label="Name" />
            <q-input
              v-if="patient"
              outlined
              readonly
              :model-value="formatDate(patient.birth_date)"
              label="Geburtsdatum"
              hint="Name und Geburtsdatum ändert die Praxis."
            />
            <q-input outlined readonly :model-value="demo.profile.email" label="E-Mail" />
            <template v-if="apiMode && editing">
              <q-input v-model="contact.phone" outlined type="tel" label="Telefon" autocomplete="tel" />
              <q-input v-model="contact.street" outlined label="Straße und Hausnummer" autocomplete="street-address" />
              <div class="row q-col-gutter-md">
                <q-input v-model="contact.postal_code" class="col-4" outlined label="PLZ" autocomplete="postal-code" />
                <q-input v-model="contact.city" class="col-8" outlined label="Ort" autocomplete="address-level2" />
              </div>
            </template>
            <template v-else-if="apiMode">
              <q-input outlined readonly :model-value="patient?.phone || '—'" label="Telefon" />
              <q-input outlined readonly :model-value="demo.profile.address || '—'" label="Adresse" />
            </template>
            <q-select
              v-else-if="editing"
              v-model="alternate"
              outlined
              emit-value
              map-options
              :options="[
                { label: 'Musterstraße 12, 12345 Musterstadt', value: false },
                { label: 'Beispielweg 8, 12345 Musterstadt', value: true },
              ]"
              label="Fiktive Adresse auswählen"
            />
            <q-input v-else outlined readonly :model-value="demo.profile.address" label="Adresse" />
            <q-banner v-if="error" rounded role="alert">{{ error }}</q-banner>
            <div v-if="editing" class="row q-gutter-sm">
              <q-btn color="primary" unelevated no-caps type="submit" label="Änderung speichern" :loading="busy" />
              <q-btn flat no-caps label="Abbrechen" @click="editing = false" />
            </div>
            <q-btn
              v-else
              outline
              color="primary"
              no-caps
              :label="apiMode ? 'Kontaktdaten bearbeiten' : 'Demo-Profil bearbeiten'"
              @click="edit"
            />
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>
