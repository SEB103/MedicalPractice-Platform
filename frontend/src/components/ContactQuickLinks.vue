<script setup lang="ts">
import { practiceContact as contact, phoneLink } from '../services/practice-config'
</script>
<template>
  <div class="q-mt-lg">
    <div class="row q-gutter-sm">
      <q-btn
        v-if="contact.phone"
        flat
        no-caps
        icon="call"
        :href="phoneLink(contact.phone)"
        :label="contact.phone"
      />
      <q-btn v-else flat no-caps icon="call" to="/kontakt" label="Telefon & Kontakt" />
      <q-btn flat no-caps icon="schedule" to="/kontakt" label="Sprechzeiten ansehen" />
    </div>
    <p class="text-body2 muted q-mt-sm">
      {{ contact.consultationHours[0]?.[0] }}: {{ contact.consultationHours[0]?.[1] }} Uhr. Weitere
      Sprechzeiten unter Kontakt · Demo.
    </p>
  </div>
</template>
