<script setup lang="ts">
import { useDemoStore } from '../../stores/demo'
import ContactQuickLinks from '../../components/ContactQuickLinks.vue'
import PracticeMedia from '../../components/PracticeMedia.vue'
const demo = useDemoStore()
</script>
<template>
  <q-page class="page-space">
    <div class="content-width">
      <section class="home-hero">
        <div>
          <p class="eyebrow text-primary">{{ demo.content.hero.eyebrow }}</p>
          <h1 class="hero-title">
            {{ demo.content.hero.lead }}
            <em>{{ demo.content.hero.emphasis }}</em>
          </h1>
          <p class="hero-description muted">{{ demo.practice.intro }}</p>
          <div class="row q-gutter-sm q-mt-lg">
            <q-btn
              color="primary"
              unelevated
              no-caps
              size="lg"
              to="/termine"
              label="Termin vereinbaren"
              icon-right="north_east"
            />
            <q-btn outline color="primary" no-caps to="/kontakt" label="Kontakt & Anfahrt" />
          </div>
          <ContactQuickLinks />
          <p class="text-caption muted q-mt-lg">
            <q-icon name="eco" class="q-mr-sm" />
            {{ demo.content.hero.note }}
          </p>
        </div>
        <div class="hero-visual">
          <PracticeMedia :asset="demo.content.hero.image" :ratio="0.96" eager :caption="false" />
          <div class="hero-note">
            <strong>Ein Ort für gute Gespräche.</strong>
            <span>Praxis Linden · Atmosphäre als Illustration</span>
          </div>
        </div>
      </section>
      <section class="values-strip row q-col-gutter-lg">
        <div v-for="value in demo.content.values" :key="value.title" class="col-12 col-md-4">
          <q-icon :name="value.icon" size="28px" color="primary" />
          <h2 class="text-subtitle1 text-weight-medium q-mt-md q-mb-sm">{{ value.title }}</h2>
          <p class="muted text-body2 q-mb-none">{{ value.text }}</p>
        </div>
      </section>
      <section class="section-space">
        <div class="row items-end justify-between q-gutter-md q-mb-lg">
          <div>
            <p class="eyebrow text-primary">Leistungen</p>
            <h2 class="section-title q-mb-none">
              Ihre Anliegen.
              <br />
              Im Mittelpunkt.
            </h2>
          </div>
          <q-btn
            flat
            no-caps
            to="/leistungen"
            label="Alle Leistungen entdecken"
            icon-right="arrow_forward"
          />
        </div>
        <div class="row q-col-gutter-md">
          <div
            v-for="(service, index) in demo.practice.services"
            :key="service.id"
            class="col-12 col-sm-6 col-lg-3"
          >
            <q-card flat bordered class="full-height">
              <q-card-section class="q-pa-lg">
                <div class="row justify-between items-center">
                  <q-icon :name="service.icon" color="primary" size="30px" />
                  <span class="text-caption muted">0{{ index + 1 }}</span>
                </div>
                <h3 class="text-h6 q-mt-lg q-mb-sm">{{ service.title }}</h3>
                <p class="muted">{{ service.description }}</p>
                <q-btn
                  flat
                  dense
                  no-caps
                  color="primary"
                  :to="'/leistungen/' + index"
                  label="Mehr erfahren"
                  icon-right="arrow_forward"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </section>
      <section class="section-space row q-col-gutter-xl items-center">
        <div class="col-12 col-md-5">
          <q-card flat class="soft-panel q-pa-xl">
            <q-icon name="format_quote" color="primary" size="48px" />
            <p class="section-title q-mt-lg">Gute Medizin beginnt damit, einander zuzuhören.</p>
            <span class="muted">Dr. Anna Linden · Fiktives Demoprofil</span>
          </q-card>
        </div>
        <div class="col-12 col-md-7">
          <p class="eyebrow text-primary">Ihre Ärztin</p>
          <h2 class="section-title">
            Persönlich für Sie.
            <br />
            Mit einem offenen Ohr.
          </h2>
          <p class="public-intro muted">{{ demo.content.about[0]?.paragraphs[0] }}</p>
          <q-btn
            outline
            color="primary"
            no-caps
            to="/ueber-mich"
            label="Über Dr. Linden"
            icon-right="arrow_forward"
          />
        </div>
      </section>
      <section class="section-space">
        <p class="eyebrow text-primary">Einfach organisiert</p>
        <h2 class="section-title">Ihr Weg in die Praxis.</h2>
        <div class="row q-col-gutter-lg">
          <div
            v-for="(item, i) in [
              'Freie Termine ansehen',
              'Datum und Zeit auswählen',
              'Anfrage prüfen und senden',
            ]"
            :key="item"
            class="col-12 col-md-4"
          >
            <q-separator class="q-mb-lg" />
            <div class="service-number q-mb-md">0{{ i + 1 }}</div>
            <h3 class="text-h6">{{ item }}</h3>
          </div>
        </div>
        <q-btn
          flat
          no-caps
          color="primary"
          to="/praxis"
          label="Mehr zum Ablauf"
          icon-right="arrow_forward"
        />
      </section>
      <q-card flat class="soft-panel q-pa-xl">
        <div class="row items-center justify-between q-gutter-lg">
          <div>
            <p class="eyebrow text-primary">Ihr Patientenbereich</p>
            <h2 class="section-title q-mb-sm">Der nächste Schritt darf einfach sein.</h2>
            <p class="muted q-mb-none">
              Termine anfragen und Ihre nächsten Besuche im Blick behalten.
            </p>
          </div>
          <q-btn
            color="primary"
            unelevated
            no-caps
            to="/anmelden"
            label="Zum Patientenbereich"
            icon-right="arrow_forward"
          />
        </div>
      </q-card>
    </div>
  </q-page>
</template>
