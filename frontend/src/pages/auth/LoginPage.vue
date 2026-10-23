<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiMode } from '../../config/api'
import { authApi, roleFor } from '../../services/api'
import { useDemoStore } from '../../stores/demo'
import PageHeading from '../../components/PageHeading.vue'
const demo = useDemoStore()
const route = useRoute()
const router = useRouter()
const email = ref('')
const password = ref('')
const busy = ref(false)
const error = ref('')
const registered = route.query.registered === '1'
function nextPath() {
  return typeof route.query.next === 'string' && route.query.next.startsWith('/patient/')
    ? route.query.next
    : '/patient/overview'
}
async function login() {
  if (!apiMode) {
    demo.state.role = 'approved'
    void router.push(nextPath())
    return
  }
  busy.value = true
  error.value = ''
  try {
    demo.me = await authApi.login(email.value.trim(), password.value)
    demo.state.role = roleFor(demo.me)
    void router.push(demo.state.role === 'approved' ? nextPath() : '/freigabe')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Anmeldung fehlgeschlagen.'
  } finally {
    busy.value = false
  }
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
        <q-banner v-if="registered" rounded class="q-mb-lg" role="status">
          Vielen Dank für Ihre Registrierung. Sie können sich jetzt anmelden; die Praxis prüft Ihre
          Registrierung und gibt die Terminbuchung frei.
        </q-banner>
        <q-form v-if="apiMode" class="q-gutter-md" @submit="login">
          <q-input
            v-model="email"
            outlined
            type="email"
            label="E-Mail-Adresse"
            autocomplete="username"
            :rules="[(v) => !!v || 'Bitte E-Mail-Adresse eingeben.']"
          />
          <q-input
            v-model="password"
            outlined
            type="password"
            label="Passwort"
            autocomplete="current-password"
            :rules="[(v) => !!v || 'Bitte Passwort eingeben.']"
          />
          <q-banner v-if="error" rounded role="alert">{{ error }}</q-banner>
          <q-btn
            color="primary"
            unelevated
            no-caps
            type="submit"
            class="full-width"
            label="Anmelden"
            :loading="busy"
          />
        </q-form>
        <template v-else>
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
        </template>
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
          :label="apiMode ? 'Jetzt registrieren' : 'Demo-Registrierung ansehen'"
          class="full-width"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>
