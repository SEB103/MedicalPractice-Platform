import type { PracticeTheme } from './domain'
export interface MediaAsset {
  id: string
  src: string
  alt: string
  width: number
  height: number
  srcset?: string
  focalPoint?: { x: number; y: number }
  caption: string
  kind: 'illustration' | 'photo'
}
export interface ContentSection {
  heading: string
  paragraphs: string[]
}
export interface ServiceContent {
  id: string
  introduction: string
  sections: ContentSection[]
  preparation: string[]
}
export interface PracticeContent {
  theme: PracticeTheme
  hero: { lead: string; emphasis: string; eyebrow: string; note: string; image: MediaAsset }
  portrait: MediaAsset | null
  gallery: MediaAsset[]
  values: { icon: string; title: string; text: string }[]
  about: ContentSection[]
  serviceDetails: ServiceContent[]
}
/** Proposed normalized Django/Wagtail response. Rendition URLs are generated on the server. */
export interface WagtailImageDto {
  id: number
  alt: string
  caption: string
  renditions: { url: string; width: number; height: number }[]
  focal_point?: { x_percent: number; y_percent: number }
}
export interface PracticeContentProvider {
  get(theme: PracticeTheme): Promise<PracticeContent>
}
