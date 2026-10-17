<script setup lang="ts">
defineProps<{ title: string; description?: string; eyebrow?: string }>()
</script>
<template>
  <div class="q-mb-lg">
    <p v-if="eyebrow" class="eyebrow text-primary q-mb-sm">{{ eyebrow }}</p>
    <h1 class="page-title q-mb-sm">{{ title }}</h1>
    <p v-if="description" class="muted text-body1 q-mb-none">{{ description }}</p>
  </div>
</template>
