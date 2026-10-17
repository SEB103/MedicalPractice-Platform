<script setup lang="ts">
import PageHeading from '../../components/PageHeading.vue'
const faq = [
  {
    q: 'Wie vereinbare ich einen Termin?',
    a: 'Öffnen Sie den Patientenbereich und melden Sie sich als Demopatient an. Im Kalender wählen Sie Tag und Uhrzeit und bestätigen Ihre Anfrage.',
  },
  {
    q: 'Warum wartet mein Account auf Freigabe?',
    a: 'Neue Accounts werden im vorgesehenen Ablauf zunächst durch die Praxis geprüft. Die endgültigen Regeln werden mit der Praxis abgestimmt.',
  },
  {
    q: 'Kann ich einen Termin ändern?',
    a: 'Öffnen Sie die Termindetails. Zukünftige aktive Termine ab morgen können in dieser Demo abgesagt oder verschoben werden.',
  },
  {
    q: 'Was soll ich zum Besuch mitbringen?',
    a: 'In einer echten Praxis können vorhandene Unterlagen und eine Liste Ihrer Fragen hilfreich sein. Die genauen Hinweise werden von der Praxis ergänzt. Hier bitte keine persönlichen Dokumente eingeben.',
  },
  {
    q: 'Wie erfolgt die Abrechnung?',
    a: 'Platzhalter für die geprüften Informationen der Privatpraxis zu Kosten und Erstattung.',
  },
  {
    q: 'Werden Daten an die Praxis gesendet?',
    a: 'Nein. Dieser Prototyp verwendet ausschließlich synthetische Daten und speichert den Demostand lokal in Ihrem Browser.',
  },
]
</script>
<template>
  <q-page class="page-space">
    <div class="content-width">
      <PageHeading
        title="Gut vorbereitet."
        eyebrow="Patienteninformationen"
        description="Antworten auf organisatorische Fragen rund um Ihren Besuch."
      />
      <q-card flat class="soft-panel q-pa-lg q-mb-xl">
        <h2 class="section-title">Ihre Fragen. Ihre Rechte.</h2>
        <p class="muted">
          Hier finden Sie organisatorische Hinweise sowie die getrennten Informationen zum Umgang
          mit Patientendaten.
        </p>
        <q-btn
          outline
          color="primary"
          no-caps
          to="/patientendatenschutz"
          label="Patientendatenschutz & Rechte"
        />
        <q-btn flat no-caps to="/barrierefreiheit" label="Barrierefreiheit" />
      </q-card>
      <q-list bordered separator class="rounded-borders">
        <q-expansion-item v-for="item in faq" :key="item.q" :label="item.q" header-class="q-py-md">
          <q-card>
            <q-card-section class="muted">{{ item.a }}</q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
      <q-btn
        color="primary"
        unelevated
        no-caps
        to="/anmelden"
        label="Patientenbereich öffnen"
        class="q-mt-lg"
      />
    </div>
  </q-page>
</template>
