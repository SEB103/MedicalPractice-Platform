<script setup lang="ts">
import { useDemoStore } from '../../stores/demo'
import PageHeading from '../../components/PageHeading.vue'
import PracticeMedia from '../../components/PracticeMedia.vue'
const demo = useDemoStore()
</script>
<template>
  <q-page class="page-space">
    <div class="content-width">
      <div class="row q-col-gutter-xl items-center q-mb-xl">
        <div class="col-12 col-md-7">
          <PageHeading
            title="Medizin, die bei Ihnen beginnt."
            eyebrow="Unsere Leistungen"
            :description="demo.practice.specialty"
          />
          <p class="public-intro muted">
            Jedes Anliegen verdient einen aufmerksamen Blick. Hier finden Sie Orientierung zu den
            Gesprächen und Angeboten unserer Demonstrationspraxis.
          </p>
          <q-btn outline no-caps color="primary" to="/termine" label="Passenden Termin finden" />
        </div>
        <div class="col-12 col-md-5">
          <PracticeMedia :asset="demo.content.hero.image" :ratio="1.45" />
        </div>
      </div>
      <section aria-label="Leistungsübersicht">
        <article
          v-for="(service, i) in demo.practice.services"
          :key="service.id"
          class="service-feature"
        >
          <div class="service-number">0{{ i + 1 }}</div>
          <div>
            <h2 class="q-mb-md">{{ service.title }}</h2>
            <p class="muted text-body1">{{ service.description }}</p>
            <div class="row q-gutter-sm">
              <q-chip outline icon="schedule">{{ service.durationMinutes }} Minuten · Demo</q-chip>
              <q-chip outline icon="person_outline">Dr. Anna Linden</q-chip>
            </div>
          </div>
          <q-btn
            flat
            no-caps
            color="primary"
            :to="'/leistungen/' + i"
            label="Im Detail"
            icon-right="arrow_forward"
          />
        </article>
      </section>
      <div class="section-space row q-col-gutter-xl">
        <div class="col-12 col-md-6">
          <h2 class="section-title">Welche Leistung passt zu mir?</h2>
          <p class="muted">
            Die Übersicht dient zur ersten Orientierung. Individuelle Fragen und das weitere
            Vorgehen werden im ärztlichen Gespräch geklärt.
          </p>
          <q-btn
            flat
            no-caps
            color="primary"
            to="/patienteninformationen"
            label="Häufige Fragen ansehen"
            icon-right="arrow_forward"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-card flat class="soft-panel q-pa-lg">
            <h2 class="text-h6">Transparenz vor dem Besuch</h2>
            <p class="muted q-mb-none">
              Angebote, Dauer und Kosten sind Beispiele. Vor dem echten Betrieb ergänzt die Praxis
              ihre geprüften Leistungen und Abrechnungsinformationen.
            </p>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>
