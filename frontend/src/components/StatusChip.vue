<script setup lang="ts">
import type { AppointmentStatus } from '../types/domain'
import { statusLabels, statusColors } from '../mocks/practice'
defineProps<{ status: AppointmentStatus }>()
</script>
<template>
  <q-chip dense square :color="statusColors[status]" text-color="white">
    {{ statusLabels[status] }}
  </q-chip>
</template>
