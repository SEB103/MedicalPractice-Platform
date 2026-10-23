import { reactive } from 'vue'
export interface LegalContent {
  title: string
  intro: string
  sections: { heading: string; text: string }[]
  sources: { label: string; url: string }[]
}
// Reactive so that legal pages loaded from the CMS (real API mode) replace these drafts.
export const legalPages = reactive<Record<string, LegalContent>>({
  impressum: {
    title: 'Impressum',
    intro: 'Anbieterkennzeichnung der Praxis · noch nicht zur Veröffentlichung freigegeben.',
    sections: [
      {
        heading: 'Anbieter & Rechtsform',
        text: '[Vollständiger Name, Rechtsform, ladungsfähige Anschrift und gegebenenfalls Vertretungsberechtigte ergänzen.]',
      },
      {
        heading: 'Kontakt',
        text: '[Telefon und E-Mail für die tatsächliche Kontaktaufnahme ergänzen.]',
      },
      {
        heading: 'Berufsrechtliche Angaben',
        text: '[Gesetzliche Berufsbezeichnung, Verleihungsstaat, zuständige Kammer und zugängliche berufsrechtliche Regelungen ergänzen.]',
      },
      {
        heading: 'Zulassung & Aufsicht',
        text: '[Zuständige Aufsichtsbehörde und erforderliche Zulassungsangaben nach Prüfung ergänzen.]',
      },
      {
        heading: 'Register & Identifikationsnummern',
        text: '[Register mit Nummer sowie Umsatzsteuer- oder Wirtschafts-Identifikationsnummer ergänzen, soweit vorhanden und anzugeben.]',
      },
      {
        heading: 'Weitere Angaben nach Einzelfallprüfung',
        text: '[Berufshaftpflichtinformationen, redaktionelle Verantwortlichkeit und Verbraucherstreitbeilegung auf Anwendbarkeit prüfen.]',
      },
      {
        heading: 'Rechtsstand & Freigabe',
        text: 'Struktur orientiert an § 5 DDG. Diese Angaben müssen anhand der konkreten Praxis geprüft werden. Verantwortliche Person und Datum der Freigabe: [ergänzen].',
      },
    ],
    sources: [
      {
        label: '§ 5 DDG · amtliche Veröffentlichung',
        url: 'https://www.gesetze-im-internet.de/ddg/__5.html',
      },
    ],
  },
  datenschutz: {
    title: 'Datenschutzerklärung',
    intro: 'Website und Patientenportal · Entwurf für die spätere konkrete Verarbeitung.',
    sections: [
      {
        heading: 'Verantwortlicher & Datenschutzkontakt',
        text: '[Name, Anschrift und Kontaktdaten des Verantwortlichen sowie gegebenenfalls des Datenschutzbeauftragten ergänzen.]',
      },
      {
        heading: 'Website, Hosting & Zugriffsdaten',
        text: '[Hosting-Anbieter, Zugriffsdaten, Zwecke, Rechtsgrundlagen, Empfänger und Löschfristen dokumentieren. Auch der Zugriffsschutz des Hosters ist einzubeziehen.]',
      },
      {
        heading: 'Browserspeicher & Einbindungen',
        text: 'Diese Demo speichert Rolle, Darstellung und synthetische Termine lokal unter medicalpractice-quasar-v1. Demo zurücksetzen stellt die Ausgangsdaten wieder her; die Browserfunktion zum Löschen von Websitedaten entfernt den Eintrag. Es sind keine Analysewerkzeuge oder externen Karten in der Anwendung eingebunden. Die tatsächliche Hosting-Umgebung ist gesondert zu prüfen.',
      },
      {
        heading: 'Kontakt, Registrierung & Terminverwaltung',
        text: '[Datenkategorien, Zwecke und Rechtsgrundlagen nach Art. 6 und gegebenenfalls Art. 9 DSGVO für die tatsächlichen Funktionen ergänzen. In dieser Demo werden keine Registrierungsdaten oder Anfragen an eine Praxis versendet.]',
      },
      {
        heading: 'Empfänger, Auftragsverarbeitung & Drittlandbezug',
        text: '[Dienstleister, Empfänger, Auftragsverarbeitung und gegebenenfalls Übermittlungen außerhalb des EWR mit anwendbaren Garantien beschreiben.]',
      },
      {
        heading: 'Speicherdauer & Bereitstellung',
        text: '[Löschfristen oder Kriterien je Verarbeitung nennen. Pflichtangaben, Folgen einer Nichtbereitstellung und gegebenenfalls automatisierte Entscheidungen erklären.]',
      },
      {
        heading: 'Ihre Datenschutzrechte',
        text: 'Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch gelten unter den jeweiligen gesetzlichen Voraussetzungen. Eine Einwilligung kann für die Zukunft widerrufen werden. [Konkreten Kontakt und Verfahren ergänzen.]',
      },
      {
        heading: 'Beschwerde & zuständige Behörde',
        text: '[Zuständige Datenschutzaufsicht mit Kontaktdaten ergänzen.] Eine Beschwerde bei einer Aufsichtsbehörde ist möglich.',
      },
      {
        heading: 'Stand & Änderungen',
        text: '[Datum, Freigabe und Verfahren zur Aktualisierung ergänzen.] Informationen zur eigentlichen Behandlung stehen getrennt in der Patienteninformation zum Datenschutz.',
      },
    ],
    sources: [
      {
        label: 'DSGVO · BfDI (amtlicher Gesetzestext in der Broschüre)',
        url: 'https://www.bfdi.bund.de/SharedDocs/Downloads/DE/Broschueren/INFO1.pdf?__blob=publicationFile&v=27',
      },
    ],
  },
  patientendatenschutz: {
    title: 'Patienteninformation zum Datenschutz',
    intro:
      'Geplante Informationen zur Behandlung und zu Ihren Rechten. Diese Demo verarbeitet keine echten Gesundheitsdaten.',
    sections: [
      {
        heading: 'Verantwortung & Ansprechpartner',
        text: '[Praxisinhaber, Adresse, Datenschutzkontakt und gegebenenfalls Datenschutzbeauftragten nennen.]',
      },
      {
        heading: 'Daten und Herkunft',
        text: '[Stamm-, Kontakt-, Versicherungs-, Behandlungs- und Abrechnungsdaten sowie mögliche Datenquellen konkret beschreiben.]',
      },
      {
        heading: 'Zwecke & Rechtsgrundlagen',
        text: '[Behandlung, Dokumentation, Terminorganisation und Abrechnung getrennt erläutern. Anwendbare Grundlagen nach Art. 6 und Art. 9 DSGVO sowie berufs- und spezialgesetzliche Vorschriften prüfen.]',
      },
      {
        heading: 'Schweigepflicht & Empfänger',
        text: '[Empfänger, etwa mitbehandelnde Stellen oder Abrechnungsdienstleister, nur entsprechend der tatsächlichen Praxisprozesse aufführen. Grundlage und Umfang jeder Weitergabe erklären.]',
      },
      {
        heading: 'Aufbewahrung & Löschung',
        text: '[Verbindliche Aufbewahrungsfristen und Löschkonzept je Datenart ergänzen. Keine pauschale Löschung trotz bestehender Aufbewahrungspflichten versprechen.]',
      },
      {
        heading: 'Datenschutzrechte & Beschwerde',
        text: '[Verfahren für Auskunft, Berichtigung, Löschung, Einschränkung, gegebenenfalls Übertragbarkeit und Widerspruch sowie Widerruf und Beschwerde erläutern. Gesetzliche Voraussetzungen und Grenzen berücksichtigen.]',
      },
      {
        heading: 'Ihre Rechte als Patientin oder Patient',
        text: 'Zu den Patientenrechten gehören verständliche Information und Aufklärung, Selbstbestimmung und Einsicht in die Patientenakte. [Die konkreten Kontaktwege für Fragen, Akteneinsicht und Beschwerden ergänzen.]',
      },
      {
        heading: 'Kontakt & geprüfter Stand',
        text: '[Ansprechpartner, Erreichbarkeit und Datum der fachlichen und rechtlichen Freigabe ergänzen.] Keine realen Anliegen über dieses Demonstrationsportal übermitteln.',
      },
    ],
    sources: [
      {
        label: 'BMG · Patientenrechte',
        url: 'https://www.bundesgesundheitsministerium.de/service/publikationen/details/ratgeber-patientenrechte',
      },
      {
        label: 'BGB § 630g · Einsichtnahme',
        url: 'https://www.gesetze-im-internet.de/bgb/__630g.html',
      },
    ],
  },
  barrierefreiheit: {
    title: 'Informationen zur Barrierefreiheit',
    intro: 'Entwicklungsziel: eine verständliche und gut bedienbare Praxiswebsite.',
    sections: [
      {
        heading: 'Ziel & Geltungsbereich',
        text: 'Die Gestaltung orientiert sich an WCAG 2.2 AA. Eine vollständige Konformität wurde nicht geprüft und wird nicht behauptet.',
      },
      {
        heading: 'Stand der Umsetzung',
        text: 'Standardkomponenten von Quasar, semantische Überschriften, Formularbeschriftungen, Tastaturfokus und reduzierte Bewegung sind vorgesehen. Browser-, Screenreader- und vollständige Kontrastprüfungen stehen noch aus.',
      },
      {
        heading: 'Anwendbare Anforderungen',
        text: '[Prüfen, ob insbesondere BFSG/BFSGV oder andere Vorschriften für Betreiber und konkretes Angebot gelten. Eine Ausnahme oder Verpflichtung wird für diese fiktive Praxis nicht behauptet.]',
      },
      {
        heading: 'Bekannte Grenzen & Rückmeldung',
        text: 'Diese Demo wurde nicht in einem realen Browser auf allen Zielgeräten abgenommen. [Geprüfte Barrieren, Alternativen und einen tatsächlich erreichbaren Feedbackkontakt ergänzen.]',
      },
      {
        heading: 'Prüfung & Aktualisierung',
        text: '[Prüfverfahren, Datum, verantwortliche Person und gegebenenfalls zuständige Durchsetzungs-/Marktüberwachungsstelle ergänzen.]',
      },
    ],
    sources: [
      {
        label: 'Bundesfachstelle Barrierefreiheit · BFSG',
        url: 'https://www.bundesfachstelle-barrierefreiheit.de/DE/Barrierefreiheitsstaerkungsgesetz/FAQ-elektronischer-Geschaeftsverkehr/faq-elektronischer-Geschaeftsverkehr_node',
      },
    ],
  },
})
