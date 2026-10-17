<script setup lang="ts">
import { ref } from 'vue'
import PageHeading from '../../components/PageHeading.vue'
const sent = ref(false)
</script>
<template>
  <q-page class="page-space flex justify-center">
    <q-card flat bordered class="auth-card self-start">
      <q-card-section class="q-pa-lg">
        <PageHeading
          title="Passwort vergessen?"
          description="Eine Vorschau des späteren Wiederherstellungsablaufs."
        />
        <q-input
          outlined
          readonly
          model-value="max.mustermann@example.invalid"
          label="Demo-E-Mail"
          class="q-mb-lg"
        />
        <q-banner v-if="sent" rounded role="status" class="q-mb-lg">
          Demo abgeschlossen: Im echten Ablauf würde eine Nachricht versendet. Hier wurde keine
          E-Mail verschickt.
        </q-banner>
        <q-btn
          color="primary"
          unelevated
          no-caps
          label="Zurücksetzen simulieren"
          @click="sent = true"
        />
        <q-btn flat no-caps to="/anmelden" label="Zurück zum Login" />
      </q-card-section>
    </q-card>
  </q-page>
</template>
