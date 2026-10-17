<script setup lang="ts">
import { patientInformation } from '../../mocks/patient-information'
import PageHeading from '../../components/PageHeading.vue'
import PracticeMedia from '../../components/PracticeMedia.vue'
import { useDemoStore } from '../../stores/demo'
const demo = useDemoStore()
const steps = patientInformation.bookingSteps
</script>
<template>
  <q-page class="page-space">
    <div class="content-width">
      <PageHeading
        title="Ein Ort zum Ankommen."
        eyebrow="Praxis & Ablauf"
        description="Ruhige Räume. Klare Organisation. Persönliche Gespräche."
      />
      <div class="row q-col-gutter-lg">
        <div
          v-for="(asset, i) in demo.content.gallery"
          :key="asset.id"
          :class="i === 0 ? 'col-12 col-md-8' : 'col-12 col-md-4'"
        >
          <PracticeMedia :asset="asset" :ratio="i === 0 ? 1.7 : 0.84" />
        </div>
      </div>
      <section class="section-space row q-col-gutter-xl">
        <div class="col-12 col-md-5">
          <p class="eyebrow text-primary">Schritt für Schritt</p>
          <h2 class="section-title">Ihr erster Besuch.</h2>
          <p class="muted">
            Vom ersten Kontakt bis zum Gespräch: Ein nachvollziehbarer Ablauf schafft Raum für das
            Wesentliche.
          </p>
          <q-btn
            color="primary"
            unelevated
            no-caps
            to="/termine"
            label="Freie Termine ansehen"
          />
        </div>
        <div class="col-12 col-md-7">
          <q-timeline color="primary">
            <q-timeline-entry
              v-for="(step, i) in steps"
              :key="step.title"
              :title="step.title"
              :subtitle="'Schritt ' + (i + 1)"
            >
              <p class="muted">{{ step.text }}</p>
            </q-timeline-entry>
          </q-timeline>
        </div>
      </section>
      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-6">
          <q-card flat bordered class="q-pa-lg full-height">
            <h2 class="text-h6">Terminorganisation</h2>
            <p class="muted">
              Ihre Anfrage erscheint im Patientenbereich. Dort können Sie ihren Status ansehen und
              zukünftige Termine im Rahmen der Demoregeln ändern.
            </p>
            <q-btn flat no-caps color="primary" to="/patient/appointments" label="Meine Termine" />
          </q-card>
        </div>
        <div class="col-12 col-md-6">
          <q-card flat bordered class="q-pa-lg full-height">
            <h2 class="text-h6">Zugang & Unterstützung</h2>
            <p class="muted">
              [Angaben zu stufenlosem Zugang, Aufzug, Sanitäranlagen und Unterstützung vor Ort
              ergänzen.]
            </p>
            <q-btn flat no-caps color="primary" to="/kontakt" label="Kontakt & Anfahrt" />
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>
