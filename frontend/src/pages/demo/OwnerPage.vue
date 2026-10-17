<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppearanceStore } from '../../stores/appearance'
import {
  customTokens,
  validHex,
  paletteOptions,
  standardPrimary,
  paletteTheme,
  type Appearance,
} from '../../services/appearance'
import DemoToolbar from '../../components/DemoToolbar.vue'
import PageHeading from '../../components/PageHeading.vue'
const owner = useAppearanceStore()
const draft = ref<Appearance>({ ...owner.config })
const message = ref('')
const valid = computed(() => validHex(draft.value.customPrimary))
const samples = computed(() =>
  [false, true].map((dark) => {
    const tokens = customTokens(draft.value.customPrimary, dark)
    if (draft.value.palette !== 'custom')
      tokens.primary = standardPrimary[draft.value.palette][dark ? 1 : 0]!
    return { dark, tokens }
  }),
)
function previewStyle(dark: boolean) {
  const palettes = {
    waldgruen: ['#f7f7f2', '#263e34', '#54655b', '#17231d', '#edf4ed', '#bdcec1'],
    pflaume: ['#fbf6f1', '#493648', '#6d5d6b', '#251f29', '#f4edf5', '#d1bfd2'],
    stahlblau: ['#f3f6f8', '#263e51', '#52677a', '#192530', '#edf4fa', '#bed0df'],
  }
  const t = customTokens(draft.value.customPrimary, dark)
  const p = draft.value.palette === 'custom' ? null : palettes[draft.value.palette]
  return { background: p ? p[dark ? 3 : 0] : t.surface, color: p ? p[dark ? 4 : 1] : t.ink }
}
function apply() {
  if (!valid.value) return
  owner.config = { ...draft.value }
  message.value = 'Farben lokal angewendet.'
}
function reset() {
  owner.reset()
  draft.value = { ...owner.config }
  message.value = 'Standardfarben wiederhergestellt.'
}
</script>
<template>
  <q-page class="page-space">
    <div class="content-width">
      <PageHeading
        title="Erscheinungsbild → Farbgestaltung"
        description="Demonstration für Praxisinhaber und autorisierte Administratoren."
      />
      <q-banner rounded class="q-mb-lg">
        Entwicklungswerkzeug, keine geschützte Administration. Änderungen gelten nur in diesem
        Browser. Im späteren Backend sind Eigentümerrechte erforderlich.
      </q-banner>
      <div class="row q-col-gutter-xl">
        <div class="col-12 col-md-5">
          <q-select
            v-model="draft.palette"
            outlined
            emit-value
            map-options
            :options="paletteOptions"
            label="Farbpalette"
          />
          <template v-if="draft.palette === 'custom'">
            <q-input
              v-model="draft.customPrimary"
              outlined
              label="Primärfarbe (HEX)"
              class="q-mt-md"
              :error="!valid"
              error-message="Bitte sechs HEX-Zeichen eingeben, z. B. #356653."
            />
            <q-color
              v-model="draft.customPrimary"
              format-model="hex"
              no-header
              no-footer
              class="q-mt-md"
              style="max-width: 100%"
            />
            <p class="muted q-mt-md">
              Sehr helle oder dunkle Farben werden für lesbare Texte und Schaltflächen angepasst.
              Hell und Dunkel erhalten eigene Kontrastwerte.
            </p>
          </template>
          <div class="row q-gutter-sm q-mt-lg">
            <q-btn
              color="primary"
              unelevated
              no-caps
              label="Farben anwenden"
              :disable="!valid"
              @click="apply"
            />
            <q-btn flat no-caps label="Standardfarben wiederherstellen" @click="reset" />
          </div>
          <p role="status" class="q-mt-md">
            {{
              owner.storageAvailable
                ? message
                : 'Browserspeicher nicht verfügbar. Änderungen gelten nur bis zum Neuladen.'
            }}
          </p>
        </div>
        <div class="col-12 col-md-7">
          <h2 class="text-h6">Vorschau · Hell und Dunkel</h2>
          <div
            v-for="sample in samples"
            :key="String(sample.dark)"
            class="q-pa-lg q-mb-md rounded-borders"
            :data-palette="paletteTheme[draft.palette]"
            :class="{ 'body--dark': sample.dark }"
            :style="previewStyle(sample.dark)"
          >
            <h3 class="text-h6">{{ sample.dark ? 'Dunkel' : 'Hell' }}</h3>
            <p>Ihre nächste Behandlung in Ruhe planen.</p>
            <q-btn
              no-caps
              unelevated
              label="Termin vereinbaren"
              :style="{ background: sample.tokens.primary, color: sample.tokens['primary-on'] }"
            />
            <p class="q-mt-md q-mb-none" :style="{ color: sample.tokens.muted }">
              Die medizinischen Inhalte bleiben unverändert.
            </p>
          </div>
        </div>
      </div>
      <q-separator class="q-my-xl" />
      <h2 class="text-h6">Entwicklungswerkzeuge</h2>
      <DemoToolbar />
    </div>
  </q-page>
</template>
