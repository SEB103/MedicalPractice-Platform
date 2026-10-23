import { reactive } from 'vue'
// Reactive so that FAQ entries loaded from the CMS (real API mode) replace these texts.
export const patientInformation = reactive({
  bookingSteps: [
    {
      title: 'Terminart wählen',
      text: 'Öffnen Sie die freien Termine und wählen Sie den passenden Anlass. Eine Anmeldung ist zum Ansehen nicht nötig.',
    },
    {
      title: 'Datum und Uhrzeit auswählen',
      text: 'Sehen Sie die nächsten freien Tage oder wählen Sie im Kalender. Die Dauer und Pausen werden berücksichtigt.',
    },
    {
      title: 'Anfrage prüfen',
      text: 'Prüfen Sie Ihre Auswahl. Erst zum Absenden benötigen Sie in dieser Demo einen freigegebenen Demoaccount.',
    },
    {
      title: 'Anfrage absenden und Status ansehen',
      text: 'Nach dem Demo-Login können Sie Ihre Auswahl fortsetzen. Eine gespeicherte Anfrage ist noch kein bestätigter Termin.',
    },
  ],
  faq: [
    {
      q: 'Wie vereinbare ich einen Termin?',
      a: 'Wählen Sie unter „Freie Termine“ zuerst die Terminart, dann Datum und Uhrzeit. Sie können freie Zeiten ohne Anmeldung ansehen. Prüfen Sie Ihre Auswahl und melden Sie sich erst zum Absenden als Demopatient an. Ihre Auswahl bleibt beim Wechsel zum Login erhalten. Die Anfrage wartet anschließend auf Bestätigung.',
    },
    {
      q: 'Warum wartet mein Account auf Freigabe?',
      a: 'Neue Accounts werden im vorgesehenen Ablauf zunächst durch die Praxis geprüft. Die endgültigen Regeln werden mit der Praxis abgestimmt. In der Demo können Sie sich alternativ mit dem freigegebenen Beispielaccount anmelden.',
    },
    {
      q: 'Kann ich einen Termin ändern?',
      a: 'Öffnen Sie die Termindetails. Zukünftige aktive Termine ab morgen können in dieser Demo abgesagt oder verschoben werden.',
    },
    {
      q: 'Was soll ich zum Besuch mitbringen?',
      a: 'Individuelle Vorbereitungshinweise ergänzt die Praxis. Hier bitte keine persönlichen Dokumente eingeben.',
    },
    {
      q: 'Wie erfolgt die Abrechnung?',
      a: 'Platzhalter für die geprüften Informationen der Privatpraxis zu Kosten und Erstattung.',
    },
    {
      q: 'Werden Daten an die Praxis gesendet?',
      a: 'Nein. Dieser Prototyp verwendet ausschließlich synthetische Daten und speichert den Demostand lokal in Ihrem Browser.',
    },
  ],
})
