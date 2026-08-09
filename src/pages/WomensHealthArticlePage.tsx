import { Flower2 } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'

interface ArticleSection {
  key: string
  title: string
  paragraphs: string[]
}

const ARTICLE_SECTIONS: ArticleSection[] = [
  {
    key: 'body-signals',
    title: "Understanding your body's signals",
    paragraphs: [
      'Everyone’s body communicates in its own way — through energy levels, mood, sleep, appetite, and other everyday patterns. Paying gentle attention to what feels typical for you, and what doesn’t, is often the first step toward better understanding your own wellness.',
      'Recorded patterns over time can be more informative than any single day. A tool like HerHealth can help you notice your own trends, but noticing a pattern is not the same as identifying its cause.',
    ],
  },
  {
    key: 'cycle-awareness',
    title: 'Menstrual and cycle awareness',
    paragraphs: [
      'Cycle length and symptoms can vary from person to person, and can also vary from month to month for the same person. Tracking dates and how you feel can help you build a clearer personal picture over time.',
      'Significant or persistent changes in your cycle are often worth discussing with a healthcare professional, since only they can properly evaluate your individual situation.',
    ],
  },
  {
    key: 'sleep-recovery',
    title: 'Sleep and recovery',
    paragraphs: [
      'Consistent, adequate sleep can support energy, mood, and general wellbeing. A steady sleep and wake schedule is a habit many people find supportive, even when total sleep time varies night to night.',
      'If sleep difficulties are frequent or ongoing, they may be worth raising with a healthcare professional.',
    ],
  },
  {
    key: 'nutrition-hydration',
    title: 'Nutrition and hydration',
    paragraphs: [
      'Regular, balanced meals and steady hydration throughout the day can support stable energy. There is no single "correct" way to eat that suits everyone — individual needs can vary widely.',
      'A registered dietitian or healthcare professional is best placed to give guidance tailored to your specific circumstances.',
    ],
  },
  {
    key: 'stress-emotional-wellbeing',
    title: 'Stress and emotional wellbeing',
    paragraphs: [
      'Stress can show up differently for different people — in mood, energy, sleep, or physical sensations. Small, repeatable moments of rest or reflection can often help over time, even if they don’t remove the source of stress itself.',
      'Emotional wellbeing is just as important as physical wellbeing, and ongoing or intense stress is a reasonable thing to bring to a healthcare professional or counselor.',
    ],
  },
  {
    key: 'preventive-wellness',
    title: 'Preventive wellness',
    paragraphs: [
      'Many people find it helpful to stay organized around routine preventive care — general check-ups, screenings, and other appointments recommended by a healthcare provider. Recommended timing for these can depend on age, personal history, and other individual factors, so there is no single universal schedule.',
      'Keeping your own simple record of what you’ve planned or completed can make preventive care easier to stay on top of.',
    ],
  },
  {
    key: 'when-to-talk-to-a-professional',
    title: 'When to consider speaking with a healthcare professional',
    paragraphs: [
      'Tracked patterns and educational information can help you understand your own wellness better, but they are not a medical evaluation. Persistent, severe, or concerning changes in how you feel are always worth discussing with a qualified healthcare professional.',
      'If you are ever experiencing a medical emergency, contact emergency services in your area immediately rather than relying on any wellness app.',
    ],
  },
]

/**
 * Women's Health — the one Knowledge Hub topic broad enough that no
 * single HerHealth product is a natural 1:1 retarget (Stage 4C1). Static,
 * read-only educational content only: no service, no calculation, no
 * persistence, no bookmarks or reading progress, matching the same
 * section/card presentation already established by HelpCenterPage.tsx and
 * MedicalDisclaimerPage.tsx.
 */
function WomensHealthArticlePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-support text-support-foreground">
          <Flower2 className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="Women's Health"
          description="A general, educational overview of women's wellness — not a diagnostic guide."
          captions={[
            'Educational information only. This article never diagnoses a condition, confirms a disease, or recommends treatment or medication.',
          ]}
        />
      </div>

      <div className="flex flex-col gap-6">
        {ARTICLE_SECTIONS.map((section) => (
          <section key={section.key} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-display text-lg text-foreground">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-body text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      <p className="text-center text-caption text-muted-foreground">
        This content is general and educational only. It does not replace personalized medical
        advice — consider discussing your own health questions with a healthcare professional.
      </p>
    </main>
  )
}

export default WomensHealthArticlePage
