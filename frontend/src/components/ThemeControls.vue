<script setup lang="ts">
import { useDemoStore } from '../stores/demo'
import { modes } from '../mocks/practice'
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
  </div>
</template>
