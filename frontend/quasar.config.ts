import { defineConfig } from '#q-app'
export default defineConfig(() => ({
  boot: ['api', 'theme'],
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
    // 'mock' (default, static GitHub Pages demo) or 'http' (real Django API under /api/v1/).
    define: {
      'process.env.MEDICALPRACTICE_API': JSON.stringify(process.env.MEDICALPRACTICE_API || 'mock'),
    },
  },
  devServer: {
    // VS Code launch config sets MEDICALPRACTICE_OPEN=1 to open the browser once the site is ready.
    open: process.env.MEDICALPRACTICE_OPEN === '1',
    // Same-origin API in development: session cookie + CSRF work without CORS.
    proxy: Object.fromEntries(
      ['/api', '/media'].map((path) => [
        path,
        { target: process.env.MEDICALPRACTICE_API_TARGET || 'http://127.0.0.1:8000' },
      ]),
    ),
  },
}))
