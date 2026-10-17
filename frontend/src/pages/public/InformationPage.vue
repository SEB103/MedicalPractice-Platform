<script setup lang="ts">
import PageHeading from '../../components/PageHeading.vue'
import { patientInformation } from '../../mocks/patient-information'
const faq = patientInformation.faq
</script>
<template>
  <q-page class="page-space">
    <div class="content-width">
      <PageHeading
        title="Gut vorbereitet."
        eyebrow="Patienteninformationen"
        description="Antworten auf organisatorische Fragen rund um Ihren Besuch."
      />
      <q-card flat class="soft-panel q-pa-lg q-mb-xl">
        <h2 class="section-title">Ihre Fragen. Ihre Rechte.</h2>
        <p class="muted">
          Hier finden Sie organisatorische Hinweise sowie die getrennten Informationen zum Umgang
          mit Patientendaten.
        </p>
        <q-btn
          outline
          color="primary"
          no-caps
          to="/patientendatenschutz"
          label="Patientendatenschutz & Rechte"
        />
        <q-btn flat no-caps to="/barrierefreiheit" label="Barrierefreiheit" />
      </q-card>
      <q-list bordered separator class="rounded-borders">
        <q-expansion-item v-for="item in faq" :key="item.q" :label="item.q" header-class="q-py-md">
          <q-card>
            <q-card-section class="muted">{{ item.a }}</q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
      <q-btn
        color="primary"
        unelevated
        no-caps
        to="/termine"
        label="Freie Termine ansehen"
        class="q-mt-lg"
      />
    </div>
  </q-page>
</template>
