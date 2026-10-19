import { defineConfig } from '#q-app'
export default defineConfig(() => ({
  boot: ['theme'],
  css: ['app.css'],
  extras: ['roboto-font', 'material-icons'],
  framework: {
    lang: 'de',
    plugins: ['Notify', 'Dialog'],
    config: {
      brand: {
        primary: '#356653',
        secondary: '#66735d',
        accent: '#c4a572',
        positive: '#287343',
        negative: '#b3261e',
        warning: '#925700',
      },
    },
  },
  build: {
    vueRouterMode: 'hash',
    // GitHub Pages serves this project under /MedicalPractice-Platform/, not the domain root.
    // Keep the usual root path for local development and other deployments.
    publicPath: process.env.MEDICALPRACTICE_BASE_PATH || '/',
    target: { browser: ['es2022'], node: 'node24' },
  },
  devServer: { open: false },
}))
