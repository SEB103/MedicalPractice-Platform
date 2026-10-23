/** Applies CMS content (real API mode) over the prototype texts; empty CMS fields keep the prototype. */
import { describeHours, type WorkingWindow } from './practice-hours'
import { mapWagtailImage } from './content'
import { practiceContact } from './practice-config'
import { patientInformation } from '../mocks/patient-information'
import { legalPages } from '../mocks/legal'
import type { ContentDto, ScheduleDto } from './api'
import type { MediaAsset, PracticeContent, WagtailImageDto } from '../types/content'

function image(dto: WagtailImageDto | null | undefined): MediaAsset | null {
  if (!dto) return null
  try {
    return mapWagtailImage(dto)
  } catch {
    return null
  }
}

export function mergeContent(base: PracticeContent, api: ContentDto | null): PracticeContent {
  if (!api) return base
  const { site } = api
  const gallery = site.gallery.map(image).filter((item): item is MediaAsset => !!item)
  const details = api.services
    .filter((d) => d.introduction || d.sections.length)
    .map((d) => ({ ...d }))
  return {
    ...base,
    hero: {
      lead: site.hero.lead || base.hero.lead,
      emphasis: site.hero.emphasis || base.hero.emphasis,
      eyebrow: site.hero.eyebrow || base.hero.eyebrow,
      note: site.hero.note || base.hero.note,
      image: image(site.hero.image) ?? base.hero.image,
    },
    portrait: image(site.portrait) ?? base.portrait,
    gallery: gallery.length ? gallery : base.gallery,
    values: site.values.length
      ? site.values.map((v) => ({ ...v, icon: v.icon || 'favorite_border' }))
      : base.values,
    about: site.about.length ? site.about : base.about,
    serviceDetails: [...details, ...base.serviceDetails],
  }
}

/** Contact, consultation hours, FAQ and legal pages are shared reactive objects. */
export function applySharedContent(api: ContentDto | null, schedule: ScheduleDto | null) {
  if (api) {
    const c = api.contact
    Object.assign(practiceContact, {
      ...(c.location_label ? { locationLabel: c.location_label } : {}),
      ...(c.address ? { address: c.address, addressVerified: c.address_verified, placeId: c.place_id || undefined } : {}),
      ...(c.phone ? { phone: c.phone, phoneNotice: c.phone_notice || undefined } : {}),
      ...(c.email ? { email: c.email } : {}),
      ...(c.telephone_hours ? { telephoneHours: c.telephone_hours } : {}),
    })
    if (api.faq.length) patientInformation.faq.splice(0, patientInformation.faq.length, ...api.faq)
    for (const [slug, page] of Object.entries(api.legal)) {
      const old = legalPages[slug]
      legalPages[slug] = {
        title: page.title || old?.title || slug,
        intro: page.intro || old?.intro || '',
        sections: page.sections.length ? page.sections : (old?.sections ?? []),
        sources: old?.sources ?? [],
      }
    }
  }
  if (schedule?.weekly.length) {
    // Server weekday 0 = Monday; prototype uses JavaScript getDay() (0 = Sunday).
    const weekly: Record<number, WorkingWindow[]> = {}
    for (const w of schedule.weekly) (weekly[(w.weekday + 1) % 7] ??= []).push({ start: w.start, end: w.end })
    practiceContact.consultationHours = describeHours(weekly)
  }
}
