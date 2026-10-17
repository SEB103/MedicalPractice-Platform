import type { RouteRecordRaw } from 'vue-router'
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../layouts/PublicLayout.vue'),
    children: [
      {
        path: 'demo/erscheinungsbild',
        component: () => import('../pages/demo/OwnerPage.vue'),
        meta: { title: 'Demo · Erscheinungsbild' },
      },
      {
        path: 'termine',
        component: () => import('../pages/patient/CalendarPage.vue'),
        meta: { title: 'Freie Termine' },
      },
      {
        path: '',
        component: () => import('../pages/public/HomePage.vue'),
        meta: { title: 'Startseite' },
      },
      {
        path: 'leistungen',
        component: () => import('../pages/public/ServicesPage.vue'),
        meta: { title: 'Leistungen' },
      },
      {
        path: 'leistungen/:id',
        component: () => import('../pages/public/ServiceDetailPage.vue'),
        meta: { title: 'Leistung' },
      },
      {
        path: 'ueber-mich',
        component: () => import('../pages/public/AboutPage.vue'),
        meta: { title: 'Über mich' },
      },
      {
        path: 'praxis',
        component: () => import('../pages/public/PracticePage.vue'),
        meta: { title: 'Praxis & Ablauf' },
      },
      {
        path: 'kontakt',
        component: () => import('../pages/public/ContactPage.vue'),
        meta: { title: 'Kontakt' },
      },
      {
        path: 'patienteninformationen',
        component: () => import('../pages/public/InformationPage.vue'),
        meta: { title: 'Patienteninformationen' },
      },
      {
        path: 'impressum',
        component: () => import('../pages/public/LegalPage.vue'),
        meta: { title: 'Impressum' },
      },
      {
        path: 'datenschutz',
        component: () => import('../pages/public/LegalPage.vue'),
        meta: { title: 'Datenschutz' },
      },
      {
        path: 'patientendatenschutz',
        component: () => import('../pages/public/LegalPage.vue'),
        meta: { title: 'Patienteninformation zum Datenschutz' },
      },
      {
        path: 'barrierefreiheit',
        component: () => import('../pages/public/LegalPage.vue'),
        meta: { title: 'Barrierefreiheit' },
      },
      {
        path: 'anmelden',
        component: () => import('../pages/auth/LoginPage.vue'),
        meta: { title: 'Anmelden' },
      },
      {
        path: 'registrieren',
        component: () => import('../pages/auth/RegisterPage.vue'),
        meta: { title: 'Registrieren' },
      },
      {
        path: 'passwort-vergessen',
        component: () => import('../pages/auth/PasswordPage.vue'),
        meta: { title: 'Passwort vergessen' },
      },
      {
        path: 'freigabe',
        component: () => import('../pages/auth/PendingPage.vue'),
        meta: { title: 'Freigabe ausstehend' },
      },
      {
        path: ':pathMatch(.*)*',
        component: () => import('../pages/public/NotFoundPage.vue'),
        meta: { title: 'Seite nicht gefunden' },
      },
    ],
  },
  {
    path: '/patient',
    component: () => import('../layouts/PatientLayout.vue'),
    children: [
      { path: '', redirect: '/patient/overview' },
      {
        path: 'overview',
        component: () => import('../pages/patient/DashboardPage.vue'),
        meta: { title: 'Mein Dashboard' },
      },
      {
        path: 'appointments',
        component: () => import('../pages/patient/AppointmentsPage.vue'),
        meta: { title: 'Meine Termine' },
      },
      {
        path: 'calendar',
        component: () => import('../pages/patient/CalendarPage.vue'),
        meta: { title: 'Kalender & Buchung' },
      },
      {
        path: 'details/:id',
        component: () => import('../pages/patient/AppointmentDetailPage.vue'),
        meta: { title: 'Termindetails' },
      },
      {
        path: 'profile',
        component: () => import('../pages/patient/ProfilePage.vue'),
        meta: { title: 'Mein Profil' },
      },
      {
        path: 'settings',
        component: () => import('../pages/patient/SettingsPage.vue'),
        meta: { title: 'Einstellungen' },
      },
    ],
  },
]
export default routes
