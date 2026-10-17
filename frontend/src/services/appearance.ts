export type Palette = 'waldgruen' | 'pflaume' | 'stahlblau' | 'custom'
export interface Appearance {
  version: 1
  palette: Palette
  customPrimary: string
}
export const paletteOptions = [
  { label: 'Waldgrün', value: 'waldgruen' },
  { label: 'Pflaume', value: 'pflaume' },
  { label: 'Stahlblau', value: 'stahlblau' },
  { label: 'Eigene Farbe', value: 'custom' },
]
export const defaults = (): Appearance => ({
  version: 1,
  palette: 'waldgruen',
  customPrimary: '#356653',
})
export const validHex = (s: string) => /^#[0-9a-f]{6}$/i.test(s)
export function parseAppearance(raw: string | null, legacy = 'hausarzt'): Appearance {
  const fallback = {
    ...defaults(),
    palette: ({ hausarzt: 'waldgruen', psychiatry: 'pflaume', gemeinschaft: 'stahlblau' }[legacy] ||
      'waldgruen') as Palette,
  }
  if (!raw) return fallback
  try {
    const s = JSON.parse(raw) as Appearance
    return s.version === 1 &&
      paletteOptions.some((p) => p.value === s.palette) &&
      validHex(s.customPrimary)
      ? { version: 1, palette: s.palette, customPrimary: s.customPrimary }
      : fallback
  } catch {
    return fallback
  }
}
function rgb(hex: string) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
}
function mix(a: string, b: string, amount: number) {
  const target = rgb(b)
  return (
    '#' +
    rgb(a)
      .map((v, i) =>
        Math.round(v * (1 - amount) + target[i]! * amount)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  )
}
function luminance(hex: string) {
  const v = rgb(hex).map((v) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return v[0]! * 0.2126 + v[1]! * 0.7152 + v[2]! * 0.0722
}
export function contrast(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
export function customTokens(input: string, dark: boolean) {
  const base = validHex(input) ? input : defaults().customPrimary
  const surface = mix(base, dark ? '#14181c' : '#ffffff', 0.96)
  const card = mix(base, dark ? '#24292e' : '#ffffff', 0.97)
  const hero = mix(base, dark ? '#24292e' : '#ffffff', 0.9)
  const ink = dark ? '#f5f5f5' : '#202124'
  const muted = dark ? '#c5cbd2' : '#50565e'
  const on = dark ? '#111111' : '#ffffff'
  let primary = base
  for (let i = 0; i <= 100; i++) {
    primary = mix(base, dark ? '#ffffff' : '#000000', i / 100)
    if (
      [surface, card, hero].every((bg) => contrast(primary, bg) >= 4.5) &&
      contrast(primary, on) >= 4.5
    )
      break
  }
  return {
    primary,
    surface,
    card,
    hero,
    ink,
    muted,
    line: mix(base, dark ? '#ffffff' : '#000000', 0.48),
    'primary-on': on,
  }
}
export const paletteTheme = {
  waldgruen: 'hausarzt',
  pflaume: 'psychiatry',
  stahlblau: 'gemeinschaft',
  custom: 'hausarzt',
} as const
export const standardPrimary = {
  waldgruen: ['#356653', '#9fd1ba'],
  pflaume: ['#725271', '#d9b5da'],
  stahlblau: ['#3d5e7c', '#aacce8'],
}
export interface AppearanceApi {
  get(): Promise<Appearance>
  update(value: Appearance, revision: string): Promise<{ value: Appearance; revision: string }>
}
