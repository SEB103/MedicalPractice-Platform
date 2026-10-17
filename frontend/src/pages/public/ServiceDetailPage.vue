<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDemoStore } from '../../stores/demo'
import PageHeading from '../../components/PageHeading.vue'
const demo = useDemoStore()
const route = useRoute()
const service = computed(() => demo.practice.services[Number(route.params.id)])
const content = computed(() => demo.content.serviceDetails.find((s) => s.id === service.value?.id))
</script>
<template>
  <q-page class="page-space">
    <div class="content-width">
      <q-btn
        flat
        no-caps
        icon="arrow_back"
        to="/leistungen"
        label="Alle Leistungen"
        class="q-mb-lg"
      />
      <template v-if="service && content">
        <PageHeading
          :title="service.title"
          :description="content.introduction"
          eyebrow="Persönliche Medizin"
        />
        <div class="row q-col-gutter-xl">
          <article class="col-12 col-md-8 article-copy">
            <section v-for="section in content.sections" :key="section.heading">
              <h2>{{ section.heading }}</h2>
              <p v-for="paragraph in section.paragraphs" :key="paragraph" class="muted">
                {{ paragraph }}
              </p>
            </section>
            <h2>Gut vorbereitet ins Gespräch</h2>
            <q-list>
              <q-item v-for="tip in content.preparation" :key="tip">
                <q-item-section avatar><q-icon name="check" color="primary" /></q-item-section>
                <q-item-section>{{ tip }}</q-item-section>
              </q-item>
            </q-list>
            <h2>Kosten & Erstattung</h2>
            <p class="muted">
              [Hier ergänzt die Praxis ihre geprüften Hinweise zu Abrechnung, möglichen Kosten und
              Erstattung. Im Prototyp gibt es keine Preiszusage.]
            </p>
          </article>
          <aside class="col-12 col-md-4">
            <q-card flat bordered class="q-pa-lg">
              <q-icon :name="service.icon" color="primary" size="40px" />
              <h2 class="text-h6 q-mt-lg">Auf einen Blick</h2>
              <q-list separator>
                <q-item>
                  <q-item-section>Dauer</q-item-section>
                  <q-item-section side>{{ service.durationMinutes }} Minuten</q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>Ärztin</q-item-section>
                  <q-item-section side>Dr. Anna Linden</q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>Ort</q-item-section>
                  <q-item-section side>Praxis Linden</q-item-section>
                </q-item>
              </q-list>
              <q-btn
                class="full-width q-mt-lg"
                color="primary"
                unelevated
                no-caps
                :to="{ path: '/termine', query: { service: service.id } }"
                label="Diesen Termin anfragen"
              />
              <p class="text-caption muted q-mt-md q-mb-none">
                Demonstration · keine echte Buchung.
              </p>
            </q-card>
            <q-btn
              flat
              no-caps
              to="/patienteninformationen"
              label="Fragen vor dem Besuch?"
              class="q-mt-md"
            />
          </aside>
        </div>
      </template>
      <PageHeading
        v-else
        title="Leistung nicht gefunden"
        description="Bitte wählen Sie eine Leistung aus der Übersicht."
      />
    </div>
  </q-page>
</template>
