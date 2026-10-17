<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useDemoStore } from '../../stores/demo'
import PageHeading from '../../components/PageHeading.vue'
const demo = useDemoStore()
const route = useRoute()
const router = useRouter()
function login() {
  demo.state.role = 'approved'
  const next =
    typeof route.query.next === 'string' && route.query.next.startsWith('/patient/')
      ? route.query.next
      : '/patient/overview'
  void router.push(next)
}
</script>
<template>
  <q-page class="page-space flex justify-center">
    <q-card flat bordered class="auth-card self-start">
      <q-card-section class="q-pa-lg">
        <q-icon name="person_outline" size="40px" color="primary" class="q-mb-md" />
        <PageHeading
          title="Willkommen zurück."
          eyebrow="Patientenbereich"
          description="Ihre Termine und Praxisinformationen an einem Ort."
        />
        <q-banner rounded class="q-mb-lg">
          Demoaccount: Max Mustermann. Bitte keine echten Zugangsdaten eingeben.
        </q-banner>
        <q-input
          outlined
          readonly
          model-value="max.mustermann@example.invalid"
          label="Demo-E-Mail"
          class="q-mb-md"
        />
        <q-input
          outlined
          readonly
          model-value="demo-password"
          type="password"
          label="Demopasswort · keine Prüfung"
          class="q-mb-lg"
        />
        <q-btn
          color="primary"
          unelevated
          no-caps
          class="full-width"
          label="Als Demopatient anmelden"
          @click="login"
        />
        <q-btn
          flat
          no-caps
          to="/passwort-vergessen"
          label="Passwort vergessen?"
          class="full-width q-mt-sm"
        />
        <q-separator class="q-my-lg" />
        <p class="muted">Neu in unserer Praxis?</p>
        <q-btn
          outline
          color="primary"
          no-caps
          :to="{ path: '/registrieren', query: { next: route.query.next } }"
          label="Demo-Registrierung ansehen"
          class="full-width"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>
