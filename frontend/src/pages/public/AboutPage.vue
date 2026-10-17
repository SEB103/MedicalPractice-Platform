<script setup lang="ts">
import PageHeading from '../../components/PageHeading.vue'
import PracticeMedia from '../../components/PracticeMedia.vue'
import { useDemoStore } from '../../stores/demo'
const demo = useDemoStore()
</script>
<template>
  <q-page class="page-space">
    <div class="content-width">
      <PageHeading
        title="Ein offenes Ohr. Ein gemeinsamer Weg."
        eyebrow="Dr. Anna Linden"
        :description="demo.practice.specialty"
      />
      <div class="row q-col-gutter-xl items-start">
        <div class="col-12 col-md-5">
          <PracticeMedia :asset="demo.content.portrait" :ratio="0.8" />
          <p class="text-caption muted q-mt-md">
            Für diese Demonstration ist kein echtes Arztporträt hinterlegt.
          </p>
        </div>
        <div class="col-12 col-md-7 article-copy">
          <section v-for="section in demo.content.about" :key="section.heading">
            <h2>{{ section.heading }}</h2>
            <p v-for="p in section.paragraphs" :key="p" class="muted">{{ p }}</p>
          </section>
          <q-btn
            outline
            color="primary"
            no-caps
            to="/termine"
            label="Ein erstes Gespräch anfragen"
          />
        </div>
      </div>
      <section class="section-space row q-col-gutter-xl">
        <div class="col-12 col-md-5">
          <p class="eyebrow text-primary">Werdegang & Haltung</p>
          <h2 class="section-title">Kompetenz nachvollziehbar machen.</h2>
          <p class="muted">
            Die folgenden Angaben werden für die konkrete Praxis vervollständigt. Es werden keine
            ungeprüften Qualifikationen behauptet.
          </p>
        </div>
        <div class="col-12 col-md-7">
          <q-list bordered separator class="rounded-borders">
            <q-item
              v-for="item in [
                'Ausbildung & Approbation',
                'Fachärztliche Qualifikation',
                'Berufliche Stationen',
                'Fortbildungen & Schwerpunkte',
              ]"
              :key="item"
            >
              <q-item-section avatar><q-icon name="school" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label>{{ item }}</q-item-label>
                <q-item-label caption>
                  [Verifizierte Angaben der tatsächlichen Ärztin ergänzen]
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </section>
      <q-card flat class="soft-panel q-pa-xl">
        <h2 class="section-title">Raum für Fragen. Zeit für Antworten.</h2>
        <p class="muted">
          Lernen Sie die Organisation der Praxis kennen und erfahren Sie, wie Ihr erster Besuch
          ablaufen kann.
        </p>
        <q-btn
          flat
          color="primary"
          no-caps
          to="/praxis"
          label="Praxis & Ablauf entdecken"
          icon-right="arrow_forward"
        />
      </q-card>
    </div>
  </q-page>
</template>
