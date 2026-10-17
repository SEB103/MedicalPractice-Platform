import type { MediaAsset, WagtailImageDto, PracticeContentProvider } from '../types/content'
import { contentByTheme } from '../mocks/content'
export function mapWagtailImage(image: WagtailImageDto): MediaAsset {
  const variants = [...image.renditions].sort((a, b) => a.width - b.width)
  const largest = variants.at(-1)
  if (!largest || variants.some((v) => !v.url || v.width <= 0 || v.height <= 0))
    throw new Error('Invalid image renditions')
  return {
    id: String(image.id),
    src: largest.url,
    width: largest.width,
    height: largest.height,
    srcset: variants.map((v) => `${v.url} ${v.width}w`).join(', '),
    alt: image.alt,
    caption: image.caption,
    kind: 'photo',
    focalPoint: image.focal_point
      ? {
          x: Math.max(0, Math.min(100, image.focal_point.x_percent)),
          y: Math.max(0, Math.min(100, image.focal_point.y_percent)),
        }
      : { x: 50, y: 50 },
  }
}
// Replace this adapter with a validated REST response when the public CMS endpoint exists.
export const contentProvider: PracticeContentProvider = {
  async get(theme) {
    return structuredClone(contentByTheme[theme])
  },
}
