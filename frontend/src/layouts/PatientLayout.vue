<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDemoStore } from '../stores/demo'
import { patientLinks } from '../mocks/practice'
import BrandLogo from '../components/BrandLogo.vue'
import ThemeControls from '../components/ThemeControls.vue'
const drawer = ref(false)
const demo = useDemoStore()
const router = useRouter()
function logout() {
  demo.state.role = 'visitor'
  void router.push('/')
}
</script>
<template>
  <q-layout view="hHh Lpr fff" class="patient-layout">
    <a
      class="skip-link"
      href="#patient-content"
      @click.prevent="($refs.main as HTMLElement)?.focus()"
    >
      Zum Inhalt
    </a>
    <q-header bordered style="color: var(--ink)">
      <div class="preview-notice">Fiktive Demonstrationspraxis · keine echte Terminbuchung</div>
      <q-toolbar class="site-toolbar" style="min-height: 70px">
        <q-btn
          flat
          round
          icon="menu"
          aria-label="Patientenmenü öffnen"
          :aria-expanded="drawer"
          aria-controls="patient-menu"
          @click="drawer = !drawer"
        />
        <BrandLogo compact />
        <q-chip outline color="primary" class="gt-xs">Patientenportal</q-chip>
        <q-space />
        <q-btn flat round icon="contrast" aria-label="Darstellung wählen">
          <q-menu>
            <div class="q-pa-md" style="width: 240px"><ThemeControls /></div>
          </q-menu>
        </q-btn>
        <q-btn
          flat
          no-caps
          icon="logout"
          :label="$q.screen.gt.xs ? 'Abmelden' : undefined"
          aria-label="Abmelden"
          @click="logout"
        />
      </q-toolbar>
    </q-header>
    <q-drawer id="patient-menu" v-model="drawer" show-if-above :width="252" bordered>
      <div class="q-pa-lg">
        <q-avatar size="48px" color="primary" text-color="white">MM</q-avatar>
        <div class="text-subtitle1 q-mt-md">Max Mustermann</div>
        <div class="muted text-caption">Freigegebener Demoaccount</div>
      </div>
      <q-separator />
      <q-list padding>
        <q-item
          v-for="link in patientLinks"
          :key="link.to"
          clickable
          :to="link.to"
          active-class="text-primary"
          @click="drawer = $q.screen.gt.sm"
        >
          <q-item-section avatar><q-icon :name="link.icon" /></q-item-section>
          <q-item-section>{{ link.label }}</q-item-section>
        </q-item>
      </q-list>
      <div class="q-pa-md">
        <q-banner rounded class="bg-transparent text-caption muted">
          Nur synthetische Daten. Änderungen werden in diesem Browser gespeichert.
        </q-banner>
        <q-btn flat no-caps icon="arrow_back" to="/" label="Zur Praxiswebsite" />
      </div>
    </q-drawer>
    <q-page-container>
      <div id="patient-content" ref="main" tabindex="-1"><router-view /></div>
    </q-page-container>
    <q-footer bordered class="patient-bottom-nav lt-md">
      <q-tabs no-caps active-color="primary" indicator-color="primary" align="justify" dense>
        <q-route-tab to="/patient/overview" icon="space_dashboard" label="Übersicht" />
        <q-route-tab to="/patient/calendar" icon="calendar_month" label="Buchen" />
        <q-route-tab to="/patient/appointments" icon="event_note" label="Termine" />
        <q-route-tab to="/patient/profile" icon="person_outline" label="Profil" />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>
