import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { practices } from '../src/mocks/practice'
const css = readFileSync(new URL('../src/css/app.css', import.meta.url), 'utf8')
function tokens(selector: string) {
  const block = css.slice(css.indexOf(selector)).split('{')[1]?.split('}')[0] ?? ''
  return Object.fromEntries(
    [...block.matchAll(/--([a-z-]+):\s*(#[\da-f]{6})/gi)].map((m) => [m[1]!, m[2]!]),
  )
}
function luminance(hex: string) {
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722
}
function contrast(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
describe('Core theme token contrast (not a rendered WCAG audit)', () => {
  for (const theme of ['hausarzt', 'psychiatry', 'gemeinschaft'] as const) {
    for (const dark of [false, true]) {
      it(`${theme} ${dark ? 'dark' : 'light'}: text and links on core surfaces`, () => {
        const values = {
          ...tokens(':root {'),
          ...(theme !== 'hausarzt' ? tokens(`:root[data-palette='${theme}']`) : {}),
          ...(dark ? tokens('body.body--dark {') : {}),
          ...(dark && theme !== 'hausarzt'
            ? tokens(`[data-palette='${theme}'] body.body--dark`)
            : {}),
        }
        const primary = dark ? practices[theme].darkPrimary : practices[theme].primary
        for (const text of [values.ink!, values.muted!, primary])
          for (const surface of [values.surface!, values.card!, values.hero!])
            expect(contrast(text, surface)).toBeGreaterThanOrEqual(4.5)
        expect(contrast(primary, values['primary-on']!)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
