import { practices } from './practice'
import type { PracticeTheme } from '../types/domain'
import type { MediaAsset, PracticeContent } from '../types/content'
const publicAssetBase = import.meta.env.BASE_URL
const definitions = {
  hausarzt: {
    lead: 'Medizin mit Zeit.',
    emphasis: 'Für Sie.',
    eyebrow: 'Ihre Gesundheit. Persönlich begleitet.',
    note: 'Persönlich. In Ruhe. Auf Augenhöhe.',
    image: `${publicAssetBase}praxis-room.svg`,
    values: [
      {
        icon: 'favorite_border',
        title: 'Ganzheitlich begleitet',
        text: 'Ihre Fragen, Ihr Alltag und Ihre persönliche Situation gehören zusammen.',
      },
      {
        icon: 'eco',
        title: 'Gesundheit im Alltag',
        text: 'Gemeinsam finden wir überschaubare nächste Schritte.',
      },
      {
        icon: 'forum',
        title: 'Verständlich erklärt',
        text: 'Zeit für ein Gespräch, in dem auch Ihre Fragen Platz haben.',
      },
    ],
  },
  psychiatry: {
    lead: 'Raum zum Ankommen.',
    emphasis: 'Zeit für Sie.',
    eyebrow: 'Psychiatrie & Psychotherapie',
    note: 'Vertraulich. Zugewandt. In Ihrem Tempo.',
    image: `${publicAssetBase}praxis-room-psychiatry.svg`,
    values: [
      {
        icon: 'forum',
        title: 'In Ruhe sprechen',
        text: 'Ein geschützter Rahmen für das, was Sie beschäftigt.',
      },
      {
        icon: 'self_improvement',
        title: 'Orientierung finden',
        text: 'Erfahrungen einordnen und mögliche nächste Schritte besprechen.',
      },
      {
        icon: 'spa',
        title: 'Persönlich begleitet',
        text: 'Die individuelle Situation steht im Mittelpunkt jedes Gesprächs.',
      },
    ],
  },
  gemeinschaft: {
    lead: 'Gut begleitet.',
    emphasis: 'Heute und morgen.',
    eyebrow: 'Ein klarer Blick auf Ihre Gesundheit.',
    note: 'Ein Kontakt. Klare Abläufe. Persönliche Medizin.',
    image: `${publicAssetBase}praxis-room-gemeinschaft.svg`,
    values: [
      {
        icon: 'calendar_month',
        title: 'Klar organisiert',
        text: 'Ihre Anfragen und kommenden Besuche auf einen Blick.',
      },
      {
        icon: 'person_outline',
        title: 'Eine Ansprechpartnerin',
        text: 'Dr. Anna Linden begleitet Sie persönlich – auch in dieser Designvariante.',
      },
      {
        icon: 'route',
        title: 'Gemeinsam weiter',
        text: 'Befunde verstehen und den nächsten Schritt planen.',
      },
    ],
  },
}
function createContent(theme: PracticeTheme): PracticeContent {
  const d = definitions[theme]
  const image: MediaAsset = {
    id: theme + '-room',
    src: d.image,
    alt: 'Illustration eines hellen Praxisraums mit Sessel und Pflanzen',
    width: 540,
    height: 560,
    caption: 'Praxisatmosphäre · Illustration, keine Aufnahme einer realen Praxis',
    kind: 'illustration',
    focalPoint: { x: 50, y: 50 },
  }
  return {
    theme,
    hero: { lead: d.lead, emphasis: d.emphasis, eyebrow: d.eyebrow, note: d.note, image },
    portrait: null,
    gallery: [
      image,
      {
        ...image,
        id: theme + '-detail',
        focalPoint: { x: 80, y: 35 },
        caption: 'Licht und natürliche Materialien · Detail der Illustration',
      },
    ],
    values: d.values,
    about: [
      {
        heading: 'Zuhören ist der Anfang.',
        paragraphs: [
          'Ein gutes Gespräch braucht Aufmerksamkeit. In der Praxis Linden sollen Sie Ihre Anliegen in Ruhe schildern und Fragen stellen können. Gemeinsam besprechen wir, was für Ihre Situation wichtig ist.',
        ],
      },
      {
        heading: 'Entscheidungen gemeinsam treffen.',
        paragraphs: [
          'Verständliche Erläuterungen und ein transparenter Ablauf helfen bei der Orientierung. Die nächsten Schritte werden im persönlichen Gespräch abgestimmt.',
        ],
      },
    ],
    serviceDetails: practices[theme].services.map((s, i) => ({
      id: s.id,
      introduction: s.description,
      sections: [
        {
          heading: [
            'Ihr Anliegen verstehen',
            'Vorausschauend planen',
            'Zusammenhänge klären',
            'Den Verlauf im Blick behalten',
          ][i]!,
          paragraphs: [
            theme === 'psychiatry'
              ? 'Das Gespräch bietet Raum für Ihre aktuelle Lebenssituation, Belastungen und persönlichen Ziele. Sie bestimmen mit, welche Themen im Vordergrund stehen.'
              : 'Im persönlichen Gespräch betrachten wir Ihre Fragen und die Informationen, die für Ihr Anliegen wichtig sind. Das weitere Vorgehen wird individuell abgestimmt.',
          ],
        },
        {
          heading: 'So ist der Termin aufgebaut',
          paragraphs: [
            'Zu Beginn klären wir Ihr Anliegen. Anschließend besprechen wir die verfügbaren Informationen, mögliche nächste Schritte und offene Fragen. Eine konkrete Behandlung wird hier nicht zugesagt.',
          ],
        },
      ],
      preparation: [
        'Notieren Sie die Fragen, die Sie besprechen möchten.',
        'Die Praxis ergänzt vor dem echten Betrieb konkrete Hinweise zu Unterlagen und Vorbereitung.',
        'Bitte geben Sie in dieser Demo keine medizinischen Informationen ein.',
      ],
    })),
  }
}
export const contentByTheme: Record<PracticeTheme, PracticeContent> = {
  hausarzt: createContent('hausarzt'),
  psychiatry: createContent('psychiatry'),
  gemeinschaft: createContent('gemeinschaft'),
}
