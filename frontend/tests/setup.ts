// Node >= 25 ships its own global Web Storage, which shadows jsdom's localStorage in Vitest.
// Restore jsdom's implementation so tests behave like a browser on every Node version.
const dom = (globalThis as { jsdom?: { window: Window } }).jsdom
for (const name of ['localStorage', 'sessionStorage'] as const) {
  if (dom && typeof globalThis[name]?.clear !== 'function')
    Object.defineProperty(globalThis, name, { value: dom.window[name], configurable: true })
}
