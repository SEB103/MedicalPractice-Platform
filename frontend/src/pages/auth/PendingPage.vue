<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useDemoStore } from '../../stores/demo'
import PageHeading from '../../components/PageHeading.vue'
const demo = useDemoStore()
const router = useRouter()
function logout() {
  demo.state.role = 'visitor'
  void router.push('/')
}
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
        <q-banner rounded class="q-mb-lg">
          Dies ist eine Simulation. Es findet keine echte Prüfung statt.
        </q-banner>
        <q-btn color="primary" unelevated no-caps to="/termine" label="Freie Termine ansehen" />
        <q-btn flat no-caps label="Abmelden" @click="logout" />
      </q-card-section>
    </q-card>
  </q-page>
</template>
