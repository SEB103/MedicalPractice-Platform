import type { PracticeTheme } from '../types/domain'
export const themes = [
  { label: 'Hausarztpraxis', value: 'hausarzt' },
  { label: 'Psychiatrische Praxis', value: 'psychiatry' },
  { label: 'Gemeinschaftspraxis', value: 'gemeinschaft' },
]
export const modes = [
  { label: 'Hell', value: 'light' },
  { label: 'Dunkel', value: 'dark' },
  { label: 'System', value: 'system' },
]
export const practices: Record<
  PracticeTheme,
  {
    specialty: string
    headline: string
    intro: string
    primary: string
    darkPrimary: string
    services: {
      id: string
      title: string
      icon: string
      description: string
      durationMinutes: number
    }[]
  }
> = {
  hausarzt: {
    specialty: 'Privatpraxis für Allgemeinmedizin',
    headline: 'Medizin mit Zeit. Für Sie.',
    intro:
      'Zuhören, verstehen und gemeinsam den nächsten Schritt gehen. Persönliche hausärztliche Begleitung in einer ruhigen Atmosphäre.',
    primary: '#356653',
    darkPrimary: '#9fd1ba',
    services: [
      {
        title: 'Hausärztliche Beratung',
        id: 'service-1',
        durationMinutes: 30,
        icon: 'favorite_border',
        description:
          'Raum für Ihre Fragen und eine gemeinsame Einordnung Ihrer gesundheitlichen Anliegen.',
      },
      {
        title: 'Vorsorge & Prävention',
        id: 'service-2',
        durationMinutes: 45,
        icon: 'health_and_safety',
        description: 'Individuelle Beratung zu Vorsorge und gesundheitsbewusster Lebensgestaltung.',
      },
      {
        title: 'Diagnostik',
        id: 'service-3',
        durationMinutes: 30,
        icon: 'monitor_heart',
        description:
          'Eine sorgfältige Anamnese bildet die Grundlage für die Planung weiterer Untersuchungen.',
      },
      {
        title: 'Langfristige Begleitung',
        id: 'service-4',
        durationMinutes: 30,
        icon: 'spa',
        description:
          'Kontinuierliche persönliche Betreuung und gemeinsam abgestimmte nächste Schritte.',
      },
    ],
  },
  psychiatry: {
    specialty: 'Privatpraxis für Psychiatrie & Psychotherapie',
    headline: 'Ein geschützter Raum. Für Ihren nächsten Schritt.',
    intro:
      'Mit Ruhe, Offenheit und einem aufmerksamen Blick auf Ihre persönliche Situation. Gemeinsam finden wir Orientierung.',
    primary: '#725271',
    darkPrimary: '#d9b5da',
    services: [
      {
        title: 'Psychiatrisches Erstgespräch',
        id: 'service-5',
        durationMinutes: 60,
        icon: 'forum',
        description:
          'Ein erstes Kennenlernen mit Zeit für Ihre aktuelle Situation und Ihre Fragen.',
      },
      {
        title: 'Psychotherapeutische Beratung',
        id: 'service-6',
        durationMinutes: 50,
        icon: 'psychology',
        description:
          'Ein vertraulicher Rahmen, um Belastungen zu verstehen und Perspektiven zu entwickeln.',
      },
      {
        title: 'Verlaufsgespräch',
        id: 'service-7',
        durationMinutes: 30,
        icon: 'timeline',
        description:
          'Gemeinsam betrachten wir den bisherigen Verlauf und besprechen weitere Schritte.',
      },
      {
        title: 'Stabilisierung & Begleitung',
        id: 'service-8',
        durationMinutes: 45,
        icon: 'self_improvement',
        description: 'Individuelle Unterstützung in herausfordernden Lebensphasen.',
      },
    ],
  },
  gemeinschaft: {
    specialty: 'Persönliche medizinische Versorgung',
    headline: 'Gut begleitet. In jeder Lebensphase.',
    intro:
      'Klare Abläufe, persönliche Gespräche und Medizin mit Augenmaß. Dr. Anna Linden ist Ihre feste Ansprechpartnerin.',
    primary: '#3d5e7c',
    darkPrimary: '#aacce8',
    services: [
      {
        title: 'Ärztliche Sprechstunde',
        id: 'service-9',
        durationMinutes: 30,
        icon: 'medical_services',
        description: 'Persönliche Beratung zu Ihren gesundheitlichen Anliegen.',
      },
      {
        title: 'Gesundheitsvorsorge',
        id: 'service-10',
        durationMinutes: 45,
        icon: 'verified_user',
        description: 'Vorausschauende Planung individueller Vorsorge.',
      },
      {
        title: 'Befundbesprechung',
        id: 'service-11',
        durationMinutes: 20,
        icon: 'description',
        description: 'Zeit für verständliche Erläuterungen und offene Fragen.',
      },
      {
        title: 'Nachsorge',
        id: 'service-12',
        durationMinutes: 30,
        icon: 'autorenew',
        description: 'Verlässliche Begleitung im weiteren Behandlungsverlauf.',
      },
    ],
  },
}
export const statusLabels = {
  confirmed: 'Termin bestätigt',
  pending: 'Termin angefragt',
  cancelled: 'Termin abgesagt',
  completed: 'Abgeschlossen',
  declined: 'Termin abgelehnt',
  no_show: 'Nicht erschienen',
  expired: 'Anfrage nicht bestätigt',
}
export const statusColors = {
  confirmed: 'green-9',
  pending: 'brown-8',
  cancelled: 'grey-7',
  completed: 'blue-grey-7',
  declined: 'red-9',
  no_show: 'red-9',
  expired: 'grey-7',
}
export const publicLinks = [
  { label: 'Startseite', to: '/' },
  { label: 'Leistungen', to: '/leistungen' },
  { label: 'Über mich', to: '/ueber-mich' },
  { label: 'Praxis & Ablauf', to: '/praxis' },
  { label: 'Kontakt', to: '/kontakt' },
]
export const patientLinks = [
  { label: 'Mein Dashboard', to: '/patient/overview', icon: 'space_dashboard' },
  { label: 'Meine Termine', to: '/patient/appointments', icon: 'event_note' },
  { label: 'Kalender & Buchung', to: '/patient/calendar', icon: 'calendar_month' },
  { label: 'Mein Profil', to: '/patient/profile', icon: 'person_outline' },
  { label: 'Einstellungen', to: '/patient/settings', icon: 'tune' },
]
