<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useDemoStore } from '../../stores/demo'
import PageHeading from '../../components/PageHeading.vue'
const demo = useDemoStore()
const $q = useQuasar()
const editing = ref(false)
const alternate = ref(demo.state.alternateAddress)
function save() {
  demo.state.alternateAddress = alternate.value
  editing.value = false
  $q.notify({ type: 'positive', message: 'Demo-Profil gespeichert.' })
}
function edit() {
  alternate.value = demo.state.alternateAddress
  editing.value = true
}
</script>
<template>
  <q-page class="page-space">
    <div class="content-width">
      <PageHeading
        title="Mein Profil"
        description="Ihr freigegebener Demoaccount. Bitte keine echten Personendaten eingeben."
      />
      <q-card flat bordered>
        <q-card-section class="q-pa-lg">
          <div class="row items-center q-gutter-md q-mb-xl">
            <q-avatar color="primary" text-color="white" size="64px">MM</q-avatar>
            <div>
              <h2 class="text-h6 q-mb-xs">{{ demo.profile.name }}</h2>
              <q-chip dense outline color="primary">Freigegeben · Demoaccount</q-chip>
            </div>
          </div>
          <q-form class="q-gutter-lg" @submit="save">
            <q-input outlined readonly :model-value="demo.profile.name" label="Name" />
            <q-input outlined readonly :model-value="demo.profile.email" label="E-Mail" />
            <q-select
              v-if="editing"
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
            <div v-if="editing" class="row q-gutter-sm">
              <q-btn color="primary" unelevated no-caps type="submit" label="Änderung speichern" />
              <q-btn flat no-caps label="Abbrechen" @click="editing = false" />
            </div>
            <q-btn
              v-else
              outline
              color="primary"
              no-caps
              label="Demo-Profil bearbeiten"
              @click="edit"
            />
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>
