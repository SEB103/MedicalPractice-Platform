<script setup lang="ts">
import { ref } from 'vue'
import { apiMode } from '../../config/api'
import { authApi } from '../../services/api'
import PageHeading from '../../components/PageHeading.vue'
const sent = ref(false)
const email = ref('')
const busy = ref(false)
const error = ref('')
async function request() {
  if (!apiMode) {
    sent.value = true
    return
  }
  busy.value = true
  error.value = ''
  try {
    await authApi.requestPasswordReset(email.value.trim())
    sent.value = true
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Anfrage fehlgeschlagen.'
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <q-page class="page-space flex justify-center">
    <q-card flat bordered class="auth-card self-start">
      <q-card-section class="q-pa-lg">
        <PageHeading
          title="Passwort vergessen?"
          :description="
            apiMode
              ? 'Wir senden Ihnen einen Link, mit dem Sie ein neues Passwort festlegen können.'
              : 'Eine Vorschau des späteren Wiederherstellungsablaufs.'
          "
        />
        <q-form class="q-gutter-md" @submit="request">
          <q-input
            v-if="apiMode"
            v-model="email"
            outlined
            type="email"
            label="E-Mail-Adresse"
            autocomplete="email"
            :rules="[(v) => !!v || 'Bitte E-Mail-Adresse eingeben.']"
          />
          <q-input
            v-else
            outlined
            readonly
            model-value="max.mustermann@example.invalid"
            label="Demo-E-Mail"
          />
          <q-banner v-if="sent" rounded role="status">
            {{
              apiMode
                ? 'Falls ein Konto mit dieser E-Mail-Adresse besteht, haben wir Ihnen einen Link gesendet.'
                : 'Demo abgeschlossen: Im echten Ablauf würde eine Nachricht versendet. Hier wurde keine E-Mail verschickt.'
            }}
          </q-banner>
          <q-banner v-if="error" rounded role="alert">{{ error }}</q-banner>
          <q-btn
            color="primary"
            unelevated
            no-caps
            type="submit"
            :loading="busy"
            :label="apiMode ? 'Link anfordern' : 'Zurücksetzen simulieren'"
          />
          <q-btn flat no-caps to="/anmelden" label="Zurück zum Login" />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>
