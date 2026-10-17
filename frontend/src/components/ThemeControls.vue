<script setup lang="ts">
import { useDemoStore } from '../stores/demo'
import { modes } from '../mocks/practice'
import { demoToolsEnabled } from '../config/demo'
const demo = useDemoStore()
</script>
<template>
  <div class="q-gutter-md">
    <q-select
      v-model="demo.state.mode"
      outlined
      emit-value
      map-options
      :options="modes"
      label="Darstellung"
    />
    <template v-if="demoToolsEnabled">
      <q-separator />
      <q-btn
        v-close-popup
        flat
        no-caps
        icon="palette"
        label="Demo: Farben & Einstellungen"
        to="/demo/erscheinungsbild"
        class="full-width"
        align="left"
      />
    </template>
  </div>
</template>
