<script setup lang="ts">
defineProps<{ compact?: boolean }>()
</script>
<template>
  <router-link to="/" class="brand" aria-label="Praxis Linden – Startseite">
    <svg viewBox="0 0 40 46" fill="none" aria-hidden="true" class="brand-mark">
      <path
        d="M20 43V15M20 30C4 29 3 19 5 14c12 0 15 8 15 16ZM20 24c15-2 17-12 14-18-12 2-16 9-14 18ZM20 16C11 10 14 4 20 1c6 5 7 10 0 15Z"
        stroke="currentColor"
        stroke-width="1.4"
      />
    </svg>
    <span>
      <strong>Praxis Linden</strong>
      <small v-if="!compact">Persönliche Medizin</small>
    </span>
  </router-link>
</template>
