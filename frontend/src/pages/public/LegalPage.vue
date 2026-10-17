<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PageHeading from '../../components/PageHeading.vue'
import { legalPages } from '../../mocks/legal'
const route = useRoute()
const page = computed(() => legalPages[route.path.slice(1)] ?? legalPages.datenschutz!)
function scrollToSection(index: number) {
  const el = document.getElementById('legal-' + index)
  el?.scrollIntoView({ block: 'start' })
  el?.focus({ preventScroll: true })
}
</script>
<template>
  <q-page class="page-space">
    <div class="content-width">
      <PageHeading
        :title="page.title"
        :description="page.intro"
        eyebrow="Rechtliche Informationen"
      />
      <q-banner rounded class="q-mb-xl">
        <template #avatar><q-icon name="info_outline" color="primary" /></template>
        Demonstrationsentwurf · nicht rechtlich freigegeben. Platzhalter müssen für die konkrete
        Praxis ausgefüllt und die gesamte Information vor Veröffentlichung geprüft werden.
      </q-banner>
      <div class="row q-col-gutter-xl">
        <aside class="col-12 col-md-4">
          <q-card flat bordered class="q-pa-md">
            <p class="eyebrow q-pa-sm">Auf dieser Seite</p>
            <q-list>
              <q-item
                v-for="(section, i) in page.sections"
                :key="section.heading"
                clickable
                @click="scrollToSection(i)"
              >
                <q-item-section>
                  {{ String(i + 1).padStart(2, '0') }} · {{ section.heading }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </aside>
        <article class="col-12 col-md-8 article-copy">
          <section
            v-for="(section, i) in page.sections"
            :key="section.heading"
            class="legal-section"
          >
            <h2 :id="'legal-' + i" tabindex="-1">{{ section.heading }}</h2>
            <p class="muted">{{ section.text }}</p>
          </section>
          <section class="q-mt-xl">
            <h2>Quellen zur redaktionellen Prüfung</h2>
            <ul>
              <li v-for="source in page.sources" :key="source.url">
                <a :href="source.url" target="_blank" rel="noopener noreferrer">
                  {{ source.label }} (neues Fenster)
                </a>
              </li>
            </ul>
            <p class="text-caption muted">
              Quellenstand: 11. Oktober 2026. Die Links ersetzen keine Prüfung des konkreten
              Angebots.
            </p>
          </section>
        </article>
      </div>
      <q-separator class="q-my-xl" />
      <div class="row q-gutter-sm">
        <q-btn flat no-caps to="/impressum" label="Impressum" />
        <q-btn flat no-caps to="/datenschutz" label="Website-Datenschutz" />
        <q-btn flat no-caps to="/patientendatenschutz" label="Patientendatenschutz" />
        <q-btn flat no-caps to="/barrierefreiheit" label="Barrierefreiheit" />
      </div>
    </div>
  </q-page>
</template>
