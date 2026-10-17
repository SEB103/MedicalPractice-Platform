<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useDemoStore } from '../stores/demo'
import { themes, modes } from '../mocks/practice'
import type { Role } from '../types/domain'
const demo = useDemoStore()
const router = useRouter()
const $q = useQuasar()
const expanded = ref(false)
const roles = [
  { label: 'Besucher', value: 'visitor' },
  { label: 'Registrierter Patient', value: 'approved' },
  { label: 'Freigabe ausstehend', value: 'pending' },
]
function changeRole(role: Role) {
  demo.state.role = role
  void router.push(
    role === 'approved' ? '/patient/overview' : role === 'pending' ? '/freigabe' : '/',
  )
}
function reset() {
  $q.dialog({
    title: 'Demo zurücksetzen?',
    message: 'Alle lokalen Demoänderungen werden auf die Ausgangsdaten zurückgesetzt.',
    cancel: { label: 'Abbrechen', flat: true },
    ok: { label: 'Zurücksetzen', color: 'primary' },
  }).onOk(() => {
    demo.reset()
    void router.push('/')
  })
}
</script>
<template>
  <div class="demo-bar">
    <div class="row items-center justify-between q-gutter-sm">
      <span class="text-caption text-weight-medium">
        MedicalPractice — Interactive Design Preview
      </span>
      <q-btn
        flat
        dense
        size="sm"
        :icon="expanded ? 'expand_less' : 'tune'"
        :label="expanded ? 'Demo schließen' : 'Demo steuern'"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      />
    </div>
    <div v-if="expanded" class="row items-center q-gutter-sm q-pt-sm">
      <q-select
        v-model="demo.state.theme"
        class="demo-select"
        dense
        outlined
        emit-value
        map-options
        :options="themes"
        label="Medizinisches Demoprofil"
      />
      <q-select
        v-model="demo.state.mode"
        class="demo-select"
        dense
        outlined
        emit-value
        map-options
        :options="modes"
        label="Darstellung"
      />
      <q-select
        :model-value="demo.state.role"
        class="demo-select"
        dense
        outlined
        emit-value
        map-options
        :options="roles"
        label="Demorolle"
        @update:model-value="changeRole"
      />
      <q-btn
        flat
        no-caps
        icon="event_busy"
        :label="demo.conflictNext ? 'Konflikt vorgemerkt' : 'Nächste Buchung: belegter Slot'"
        @click="demo.conflictNext = !demo.conflictNext"
      />
      <q-btn flat dense icon="restart_alt" label="Demo zurücksetzen" @click="reset" />
      <q-btn
        flat
        dense
        icon="wifi_off"
        :label="demo.failNext ? 'Fehler vorgemerkt' : 'Nächste Anfrage: Fehler'"
        @click="demo.failNext = !demo.failNext"
      />
    </div>
    <div v-if="!demo.storageAvailable" role="status" class="text-caption">
      Browserspeicher nicht verfügbar. Änderungen gelten bis zum Neuladen.
    </div>
  </div>
</template>
