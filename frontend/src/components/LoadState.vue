<script setup lang="ts">
defineProps<{ loading: boolean; error: string }>()
defineEmits<{ retry: [] }>()
</script>
<template>
  <div v-if="loading" role="status" class="q-py-xl text-center">
    <q-spinner color="primary" size="32px" />
    <div class="q-mt-sm">Termine werden geladen …</div>
  </div>
  <q-banner v-else-if="error" rounded class="q-my-lg" role="alert">
    <template #avatar><q-icon name="error_outline" color="negative" /></template>
    {{ error }}
    <template #action>
      <q-btn flat no-caps label="Erneut versuchen" @click="$emit('retry')" />
    </template>
  </q-banner>
  <slot v-else />
</template>
