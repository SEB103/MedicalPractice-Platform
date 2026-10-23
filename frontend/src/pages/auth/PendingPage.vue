<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiMode } from '../../config/api'
import { useDemoStore } from '../../stores/demo'
import { useSession } from '../../composables/useSession'
import PageHeading from '../../components/PageHeading.vue'
const demo = useDemoStore()
const { logout } = useSession()
const route = useRoute()
const router = useRouter()
// The practice may have approved the account meanwhile: re-check on every visit.
onMounted(async () => {
  if (!apiMode) return
  await demo.refreshMe().catch(() => undefined)
  if (demo.state.role === 'approved') {
    const next = typeof route.query.next === 'string' && route.query.next.startsWith('/patient/')
    void router.replace(next ? String(route.query.next) : '/patient/overview')
  } else if (demo.state.role === 'visitor') void router.replace('/anmelden')
})
</script>
<template>
  <q-page class="page-space flex justify-center">
    <q-card flat bordered class="auth-card self-start">
      <q-card-section class="q-pa-lg">
        <q-icon name="hourglass_top" color="primary" size="48px" class="q-mb-lg" />
        <PageHeading
          title="Ihre Freigabe steht noch aus."
          description="Die Praxis prüft neue Registrierungen. Anschließend steht Ihnen die Terminbuchung zur Verfügung."
        />
        <q-banner v-if="apiMode && demo.me?.patient?.status === 'rejected'" rounded class="q-mb-lg">
          Ihre Registrierung wurde von der Praxis nicht freigegeben. Bitte wenden Sie sich direkt an die Praxis.
        </q-banner>
        <q-banner v-else-if="!apiMode" rounded class="q-mb-lg">
          Dies ist eine Simulation. Es findet keine echte Prüfung statt.
        </q-banner>
        <q-btn color="primary" unelevated no-caps to="/termine" label="Freie Termine ansehen" />
        <q-btn v-if="!apiMode" flat no-caps to="/anmelden?next=/patient/calendar" label="Mit freigegebenem Demoaccount fortfahren" />
        <q-btn flat no-caps label="Abmelden" @click="logout()" />
      </q-card-section>
    </q-card>
  </q-page>
</template>
