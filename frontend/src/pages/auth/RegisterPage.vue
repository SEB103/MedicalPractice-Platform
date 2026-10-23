<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiMode } from '../../config/api'
import { authApi, type RegistrationInput } from '../../services/api'
import { fieldErrors } from '../../services/http'
import { useDemoStore } from '../../stores/demo'
import PageHeading from '../../components/PageHeading.vue'
const agreed = ref(false)
const demo = useDemoStore()
const router = useRouter()
const route = useRoute()
const busy = ref(false)
const error = ref('')
const errors = ref<Record<string, string>>({})
const form = reactive<Omit<RegistrationInput, 'privacy_accepted'>>({
  first_name: '',
  last_name: '',
  birth_date: '',
  email: '',
  phone: '',
  street: '',
  postal_code: '',
  city: '',
  password: '',
})
const required = (v: string) => !!v || 'Pflichtfeld'
async function register() {
  if (!agreed.value) return
  if (!apiMode) {
    demo.state.role = 'pending'
    void router.push({ path: '/freigabe', query: { next: route.query.next } })
    return
  }
  busy.value = true
  error.value = ''
  errors.value = {}
  try {
    await authApi.register({ ...form, email: form.email.trim(), privacy_accepted: true })
    void router.push({ path: '/anmelden', query: { registered: '1', next: route.query.next } })
  } catch (e) {
    errors.value = fieldErrors(e)
    error.value = e instanceof Error ? e.message : 'Registrierung fehlgeschlagen.'
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
          title="Der erste Schritt."
          eyebrow="Registrieren"
          :description="
            apiMode
              ? 'Nach Ihrer Registrierung prüft die Praxis Ihre Angaben und gibt die Terminbuchung frei.'
              : 'Sehen Sie, wie eine neue Registrierung ablaufen wird.'
          "
        />
        <q-form v-if="apiMode" class="q-gutter-md" @submit="register">
          <div class="row q-col-gutter-md">
            <q-input v-model="form.first_name" class="col-12 col-sm-6" outlined label="Vorname *"
              autocomplete="given-name" :rules="[required]" :error="!!errors.first_name" :error-message="errors.first_name" />
            <q-input v-model="form.last_name" class="col-12 col-sm-6" outlined label="Nachname *"
              autocomplete="family-name" :rules="[required]" :error="!!errors.last_name" :error-message="errors.last_name" />
          </div>
          <q-input v-model="form.birth_date" outlined type="date" label="Geburtsdatum *" stack-label
            autocomplete="bday" :rules="[required]" :error="!!errors.birth_date" :error-message="errors.birth_date" />
          <q-input v-model="form.email" outlined type="email" label="E-Mail-Adresse *" autocomplete="email"
            :rules="[required]" :error="!!errors.email" :error-message="errors.email" />
          <q-input v-model="form.phone" outlined type="tel" label="Telefon (optional)" autocomplete="tel"
            :error="!!errors.phone" :error-message="errors.phone" />
          <q-input v-model="form.street" outlined label="Straße und Hausnummer (optional)" autocomplete="street-address" />
          <div class="row q-col-gutter-md">
            <q-input v-model="form.postal_code" class="col-4" outlined label="PLZ" autocomplete="postal-code" />
            <q-input v-model="form.city" class="col-8" outlined label="Ort" autocomplete="address-level2" />
          </div>
          <q-input v-model="form.password" outlined type="password" label="Passwort *" autocomplete="new-password"
            hint="Mindestens 8 Zeichen, nicht nur Ziffern."
            :rules="[required]" :error="!!errors.password" :error-message="errors.password" />
          <q-checkbox v-model="agreed">
            Ich habe die <router-link to="/datenschutz">Datenschutzhinweise</router-link> gelesen und bin
            mit der Verarbeitung meiner Angaben zur Terminvereinbarung einverstanden. *
          </q-checkbox>
          <q-banner v-if="error" rounded role="alert">{{ error }}</q-banner>
          <q-btn color="primary" unelevated no-caps type="submit" class="full-width"
            label="Registrieren" :loading="busy" :disable="!agreed" />
          <q-btn flat no-caps to="/anmelden" label="Bereits registriert? Zum Login" class="full-width" />
        </q-form>
        <template v-else>
          <q-banner rounded class="q-mb-lg">
            Die Felder sind mit fiktiven Daten vorbelegt und gesperrt. Es werden keine Daten
            versendet.
          </q-banner>
          <q-form class="q-gutter-md" @submit="register">
            <q-input outlined readonly model-value="Max Mustermann" label="Name · Demo" />
            <q-input
              outlined
              readonly
              model-value="max.mustermann@example.invalid"
              label="E-Mail · Demo"
            />
            <q-input
              outlined
              readonly
              type="password"
              model-value="demo-password"
              label="Passwort · Demo"
            />
            <q-checkbox
              v-model="agreed"
              label="Ich möchte die Registrierung mit Demodaten simulieren."
            />
            <q-btn
              color="primary"
              unelevated
              no-caps
              type="submit"
              class="full-width"
              label="Demo-Registrierung starten"
              :disable="!agreed"
            />
            <q-btn
              flat
              no-caps
              to="/anmelden"
              label="Bereits registriert? Zum Login"
              class="full-width"
            />
          </q-form>
        </template>
      </q-card-section>
    </q-card>
  </q-page>
</template>
