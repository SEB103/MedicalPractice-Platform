<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDemoStore } from '../../stores/demo'
import PageHeading from '../../components/PageHeading.vue'
const agreed = ref(false)
const demo = useDemoStore()
const router = useRouter()
const route = useRoute()
function register() {
  if (!agreed.value) return
  demo.state.role = 'pending'
  void router.push({ path:'/freigabe', query: { next: route.query.next } })
}
</script>
<template>
  <q-page class="page-space flex justify-center">
    <q-card flat bordered class="auth-card self-start">
      <q-card-section class="q-pa-lg">
        <PageHeading
          title="Der erste Schritt."
          eyebrow="Registrieren"
          description="Sehen Sie, wie eine neue Registrierung ablaufen wird."
        />
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
      </q-card-section>
    </q-card>
  </q-page>
</template>
