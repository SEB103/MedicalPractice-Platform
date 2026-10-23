<script setup lang="ts">
import { apiMode } from '../config/api'
import { ref } from 'vue'
import { useDemoStore } from '../stores/demo'
import { publicLinks } from '../mocks/practice'
import BrandLogo from '../components/BrandLogo.vue'
import ThemeControls from '../components/ThemeControls.vue'
const menu = ref(false)
const demo = useDemoStore()
</script>
<template>
  <q-layout view="hHh lpR fff" class="public-layout">
    <a class="skip-link" href="#main-content" @click.prevent="($refs.main as HTMLElement)?.focus()">
      Zum Inhalt
    </a>
    <q-header bordered class="text-inherit" style="color: var(--ink)">
      <div v-if="!apiMode" class="preview-notice">Fiktive Demonstrationspraxis · keine echte Terminbuchung</div>
      <q-toolbar class="site-toolbar q-px-md" style="min-height: 76px">
        <BrandLogo />
        <q-space />
        <q-btn flat round icon="contrast" aria-label="Darstellung wählen">
          <q-menu>
            <div class="q-pa-md" style="width: 240px"><ThemeControls /></div>
          </q-menu>
        </q-btn>
        <nav class="gt-md row" aria-label="Hauptnavigation">
          <q-btn
            v-for="link in publicLinks"
            :key="link.to"
            flat
            no-caps
            :to="link.to"
            :label="link.label"
            :exact="link.to === '/'"
          />
        </nav>
        <q-btn
          color="primary"
          unelevated
          no-caps
          icon="person_outline"
          label="Patientenbereich"
          :to="demo.state.role === 'approved' ? '/patient/overview' : '/anmelden'"
          class="q-ml-sm portal-entry"
        />
        <q-btn
          flat
          round
          icon="menu"
          aria-label="Navigation öffnen"
          :aria-expanded="menu"
          aria-controls="public-menu"
          class="lt-lg q-ml-xs"
          @click="menu = !menu"
        />
      </q-toolbar>
    </q-header>
    <q-drawer id="public-menu" v-model="menu" overlay bordered side="right" :width="280">
      <q-list padding>
        <q-item-label header>Praxis Linden</q-item-label>
        <q-item
          v-for="link in publicLinks"
          :key="link.to"
          clickable
          :to="link.to"
          :exact="link.to === '/'"
          @click="menu = false"
        >
          <q-item-section>{{ link.label }}</q-item-section>
        </q-item>
        <q-item clickable to="/patienteninformationen" @click="menu = false">
          <q-item-section>Patienteninformationen</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
    <q-page-container>
      <div id="main-content" ref="main" tabindex="-1">
        <q-banner v-if="demo.publicContentError" role="status" class="q-ma-md">
          {{ demo.publicContentError }}
        </q-banner>
        <router-view />
      </div>
    </q-page-container>
    <q-footer class="bg-transparent" style="color: var(--ink)">
      <q-separator />
      <div class="content-width q-pa-lg row q-col-gutter-lg footer-brand">
        <div class="col-12 col-md-5">
          <BrandLogo />
          <p class="muted q-mt-sm">
            {{ demo.practice.specialty }}
            <br />
            Dr. Anna Linden · Fiktive Demonstrationspraxis
          </p>
          <p class="text-caption muted">Alle Angaben sind erfunden. Keine echte Terminbuchung.</p>
        </div>
        <div class="col-12 col-md-7 row q-gutter-sm items-start justify-end">
          <q-btn flat no-caps to="/patienteninformationen" label="Patienteninformationen" />
          <q-btn flat no-caps to="/kontakt" label="Kontakt" />
          <q-btn flat no-caps to="/impressum" label="Impressum" />
          <q-btn flat no-caps to="/datenschutz" label="Datenschutz" />
          <q-btn flat no-caps to="/patientendatenschutz" label="Patientendatenschutz" />
          <q-btn flat no-caps to="/barrierefreiheit" label="Barrierefreiheit" />
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>
