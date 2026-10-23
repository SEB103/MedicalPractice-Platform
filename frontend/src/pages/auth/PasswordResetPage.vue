<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { authApi } from '../../services/api'
import { fieldErrors } from '../../services/http'
import PageHeading from '../../components/PageHeading.vue'
const route = useRoute()
const password = ref('')
const done = ref(false)
const busy = ref(false)
const error = ref('')
async function save() {
  busy.value = true
  error.value = ''
  try {
    await authApi.confirmPasswordReset(String(route.query.uid ?? ''), String(route.query.token ?? ''), password.value)
    done.value = true
  } catch (e) {
    error.value = fieldErrors(e).new_password ?? (e instanceof Error ? e.message : 'Fehlgeschlagen.')
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <q-page class="page-space flex justify-center">
    <q-card flat bordered class="auth-card self-start">
      <q-card-section class="q-pa-lg">
        <PageHeading title="Neues Passwort festlegen" />
        <q-banner v-if="done" rounded role="status" class="q-mb-lg">
          Ihr Passwort wurde geändert. Sie können sich jetzt anmelden.
        </q-banner>
        <q-form v-else class="q-gutter-md" @submit="save">
          <q-input
            v-model="password"
            outlined
            type="password"
            label="Neues Passwort"
            autocomplete="new-password"
            hint="Mindestens 8 Zeichen, nicht nur Ziffern."
            :rules="[(v) => !!v || 'Bitte Passwort eingeben.']"
          />
          <q-banner v-if="error" rounded role="alert">{{ error }}</q-banner>
          <q-btn color="primary" unelevated no-caps type="submit" label="Passwort speichern" :loading="busy" />
        </q-form>
        <q-btn flat no-caps to="/anmelden" label="Zum Login" class="q-mt-md" />
      </q-card-section>
    </q-card>
  </q-page>
</template>
