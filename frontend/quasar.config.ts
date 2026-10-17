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
  build: { vueRouterMode: 'hash', target: { browser: ['es2022'], node: 'node24' } },
  devServer: { open: false },
}))
