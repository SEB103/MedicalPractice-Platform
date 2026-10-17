<script setup lang="ts">
import { useDemoStore } from '../../stores/demo'
import PageHeading from '../../components/PageHeading.vue'
import ThemeControls from '../../components/ThemeControls.vue'
const demo = useDemoStore()
</script>
<template>
  <q-page class="page-space">
    <div class="content-width">
      <PageHeading
        title="Einstellungen"
        description="Passen Sie die Darstellung an. Änderungen werden automatisch lokal gespeichert."
      />
      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-6">
          <q-card flat bordered>
            <q-card-section class="q-pa-lg">
              <h2 class="text-h6">Darstellung</h2>
              <ThemeControls />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-6">
          <q-card flat bordered>
            <q-card-section class="q-pa-lg">
              <h2 class="text-h6">Benachrichtigungen</h2>
              <q-toggle v-model="demo.state.notifications" label="Terminerinnerungen · Demo" />
              <p class="muted q-mt-md">
                Die Einstellung wird gespeichert. Es werden keine E-Mails oder Benachrichtigungen
                versendet.
              </p>
              <q-separator class="q-my-lg" />
              <q-btn
                flat
                no-caps
                color="primary"
                to="/datenschutz"
                label="Informationen zum Datenschutz"
                icon-right="arrow_forward"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>
