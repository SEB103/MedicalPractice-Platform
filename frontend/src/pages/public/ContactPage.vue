<script setup lang="ts">
import { practiceContact, mapLinks, phoneLink } from '../../services/practice-config'
import PageHeading from '../../components/PageHeading.vue'
import PracticeMedia from '../../components/PracticeMedia.vue'
import { useDemoStore } from '../../stores/demo'
const demo = useDemoStore()
const contact = practiceContact
const hours = contact.consultationHours
const maps = mapLinks(contact)
</script>
<template>
  <q-page class="page-space">
    <div class="content-width">
      <PageHeading
        title="Der direkte Weg zu uns."
        eyebrow="Kontakt & Anfahrt"
        description="Praxis Linden · alle Kontaktdaten sind Demonstrationsangaben."
      />
      <div class="row q-col-gutter-xl">
        <div class="col-12 col-md-6">
          <q-card flat bordered class="q-pa-lg">
            <h2 class="section-title">Praxis Linden</h2>
            <p class="muted">
              Dr. Anna Linden
              <br />
              {{ contact.locationLabel }}
              <br />
              {{ contact.address }}
              <br />
              <a :href="'mailto:' + contact.email">{{ contact.email }}</a>
              · Demo, nicht zustellbar
            </p>
            <q-btn
              v-if="contact.phone"
              outline
              no-caps
              icon="call"
              :href="phoneLink(contact.phone)"
              :label="contact.phone"
            />
            <p v-else class="muted">
              Telefon: noch nicht hinterlegt. In dieser Demo ist kein Anruf möglich.
            </p>
            <h3 class="text-h6">Telefonische Erreichbarkeit</h3>
            <p>{{ contact.telephoneHours }}</p>
            <q-separator class="q-my-lg" />
            <h3 class="text-h6">Sprechzeiten · Demo</h3>
            <q-list separator>
              <q-item v-for="[day, hour] in hours" :key="day">
                <q-item-section>
                  <q-item-label>{{ day }}</q-item-label>
                  <q-item-label caption>{{ hour }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <p class="text-caption muted q-mt-md">
              Termine nach Vereinbarung. Urlaub und Sonderzeiten berücksichtigt der Demokalender.
            </p>
            <q-btn color="primary" unelevated no-caps to="/termine" label="Termin vereinbaren" />
          </q-card>
        </div>
        <div class="col-12 col-md-6">
          <PracticeMedia :asset="demo.content.hero.image" :ratio="1.5" />
          <q-card flat class="soft-panel q-pa-lg q-mt-lg">
            <q-icon name="location_on" color="primary" size="32px" />
            <h2 class="text-h6 q-mt-md">Anfahrt & Orientierung</h2>
            <p class="muted">
              Als Beispiel für Karten und Routen verwenden wir das Rathaus Göppingen. Die
              Sprechzeiten oben sind erfundene Praxiszeiten, nicht die Öffnungszeiten des Rathauses.
            </p>
            <div class="row q-gutter-sm q-mb-md">
              <q-btn
                outline
                color="primary"
                no-caps
                icon="map"
                label="Auf Karte zeigen"
                :disable="!maps"
                :href="maps?.map"
                target="_blank"
                rel="noopener noreferrer"
              />
              <q-btn
                outline
                color="primary"
                no-caps
                icon="directions"
                label="Route planen"
                :disable="!maps"
                :href="maps?.route"
                target="_blank"
                rel="noopener noreferrer"
              />
            </div>
            <p class="text-caption muted q-mb-none">
              Die Karte öffnet Google Maps erst nach Ihrem Klick. Das Ziel ist das Rathaus
              Göppingen, ausschließlich als Demostandort – keine Arztpraxis.
            </p>
          </q-card>
        </div>
      </div>
      <section class="section-space row q-col-gutter-xl">
        <div class="col-12 col-md-6">
          <h2 class="section-title">Eine organisatorische Frage?</h2>
          <p class="muted">
            Antworten zur Registrierung, Vorbereitung und Terminänderung finden Sie in unseren
            Patienteninformationen.
          </p>
          <q-btn
            flat
            no-caps
            color="primary"
            to="/patienteninformationen"
            label="Zu den häufigen Fragen"
            icon-right="arrow_forward"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-banner rounded>
            Dieses Demonstrationsportal bearbeitet keine medizinischen Anliegen und keine Notfälle.
            Eine Kontaktform ist für eine spätere Version vorgesehen. Aktuell werden keine
            Nachrichten gesendet oder medizinischen Angaben erfasst.
          </q-banner>
        </div>
      </section>
    </div>
  </q-page>
</template>
