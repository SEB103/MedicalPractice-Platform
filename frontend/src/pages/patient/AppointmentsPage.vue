<script setup lang="ts">
import { computed, ref } from 'vue'
import type { QTableColumn } from 'quasar'
import PageHeading from '../../components/PageHeading.vue'
import StatusChip from '../../components/StatusChip.vue'
import LoadState from '../../components/LoadState.vue'
import { useAppointments } from '../../composables/useAppointments'
import { berlinToday, formatDate } from '../../services/appointments'
const { records, loading, error, load } = useAppointments()
const filter = ref('upcoming')
const rows = computed(() =>
  records.value
    .filter(
      (a) =>
        filter.value === 'all' ||
        (filter.value === 'upcoming'
          ? ['confirmed', 'pending'].includes(a.status) && a.date >= berlinToday()
          : a.status === 'cancelled' || a.status === 'completed' || a.date < berlinToday()),
    )
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
)
const columns: QTableColumn[] = [
  { name: 'date', label: 'Datum', field: 'date', align: 'left', sortable: true },
  { name: 'time', label: 'Uhrzeit', field: 'time', align: 'left' },
  { name: 'service', label: 'Terminart', field: 'service', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'action', label: '', field: 'id', align: 'right' },
]
</script>
<template>
  <q-page class="page-space">
    <div class="content-width">
      <div class="row justify-between items-start q-gutter-md">
        <PageHeading
          title="Meine Termine"
          description="Anfragen, bestätigte Besuche und vergangene Termine."
        />
        <q-btn
          color="primary"
          unelevated
          no-caps
          icon="add"
          to="/patient/calendar"
          label="Neuer Termin"
        />
      </div>
      <q-tabs v-model="filter" align="left" active-color="primary" no-caps class="q-mb-lg">
        <q-tab name="upcoming" label="Bevorstehend" />
        <q-tab name="history" label="Verlauf" />
        <q-tab name="all" label="Alle" />
      </q-tabs>
      <LoadState :loading="loading" :error="error" @retry="load">
        <q-table
          flat
          bordered
          :rows="rows"
          :columns="columns"
          row-key="id"
          :grid="$q.screen.lt.md"
          :pagination="{ rowsPerPage: 10 }"
          no-data-label="Keine Termine in dieser Ansicht."
          rows-per-page-label="Termine pro Seite"
        >
          <template #body-cell-date="props">
            <q-td :props="props">{{ formatDate(props.row.date) }}</q-td>
          </template>
          <template #body-cell-status="props">
            <q-td :props="props"><StatusChip :status="props.row.status" /></q-td>
          </template>
          <template #body-cell-action="props">
            <q-td :props="props">
              <q-btn
                flat
                no-caps
                color="primary"
                :to="'/patient/details/' + props.row.id"
                label="Details"
                icon-right="chevron_right"
              />
            </q-td>
          </template>
          <template #item="props">
            <div class="col-12 q-pa-xs">
              <q-card flat bordered>
                <q-card-section>
                  <div class="row justify-between items-center">
                    <span class="text-subtitle1">{{ formatDate(props.row.date) }}</span>
                    <StatusChip :status="props.row.status" />
                  </div>
                  <p class="q-mt-sm">{{ props.row.time }} Uhr · {{ props.row.service }}</p>
                  <q-btn
                    outline
                    no-caps
                    color="primary"
                    :to="'/patient/details/' + props.row.id"
                    label="Details ansehen"
                  />
                </q-card-section>
              </q-card>
            </div>
          </template>
        </q-table>
      </LoadState>
    </div>
  </q-page>
</template>
