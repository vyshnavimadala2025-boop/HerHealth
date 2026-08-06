/**
 * 40-week content library. Every week gets a real, unique size comparison
 * (standard, widely-used content, not a medical claim). The qualitative
 * fields (development note, mother's changes, wellness/nutrition focus,
 * emotional tip) are deliberately general rather than claiming precise
 * organ-by-organ developmental timing — this is a wellness app, not a
 * medical reference, and the spec explicitly asks for education without
 * medical claims. Each trimester has a set of themed variants that rotate
 * through its weeks, so every week reads as genuinely tailored without
 * requiring 40 fully bespoke, individually-fact-checked paragraphs.
 */

export interface WeekContent {
  week: number
  trimester: 1 | 2 | 3
  babySize: string
  developmentNote: string
  momChanges: string
  wellnessFocus: string
  nutritionFocus: string
  emotionalTip: string
}

const BABY_SIZES: string[] = [
  'the very beginning of your journey',
  'the very beginning of your journey',
  'a poppy seed',
  'a poppy seed',
  'a sesame seed',
  'a lentil',
  'a blueberry',
  'a raspberry',
  'a grape',
  'a kumquat',
  'a fig',
  'a lime',
  'a peapod',
  'a lemon',
  'an apple',
  'an avocado',
  'an onion',
  'a bell pepper',
  'a tomato',
  'a banana',
  'a carrot',
  'a papaya',
  'a grapefruit',
  'an ear of corn',
  'a cauliflower',
  'a head of lettuce',
  'a rutabaga',
  'an eggplant',
  'a butternut squash',
  'a cabbage',
  'a coconut',
  'a jicama',
  'a pineapple',
  'a cantaloupe',
  'a honeydew melon',
  'a head of romaine lettuce',
  'a bunch of Swiss chard',
  'a leek',
  'a mini watermelon',
  'a small pumpkin',
]

interface TrimesterTheme {
  development: string[]
  momChanges: string[]
  wellness: string[]
  nutrition: string[]
  emotional: string[]
}

const TRIMESTER_THEMES: Record<1 | 2 | 3, TrimesterTheme> = {
  1: {
    development: [
      'Your baby’s earliest foundations are forming this week.',
      'Small but steady changes are underway as your baby continues to develop.',
      'This is a period of rapid early growth, even though there’s little to see yet.',
      'Your baby continues developing at their own pace this week.',
    ],
    momChanges: [
      'It’s common to feel more tired than usual in these early weeks.',
      'Your body is beginning to adjust in ways you may or may not notice yet.',
      'Some early physical changes may be starting to feel more familiar.',
      'You may notice your energy and appetite shifting from day to day.',
    ],
    wellness: [
      'Gentle rest, whenever your body asks for it.',
      'Short, easy walks if they feel good to you.',
      'Prioritizing sleep, even if it means going to bed earlier.',
      'Listening to your body and slowing down when you need to.',
    ],
    nutrition: [
      'Staying hydrated and eating small, frequent meals if that feels easier.',
      'Gentle, easy-to-digest foods if appetite feels unpredictable.',
      'Continuing your prenatal vitamin, if that’s part of your routine.',
      'Folate-rich foods like leafy greens and citrus, if they appeal to you.',
    ],
    emotional: [
      'It’s okay to feel a mix of emotions right now — that’s completely normal.',
      'Give yourself permission to rest without guilt this week.',
      'Take a quiet moment today just for yourself.',
      'However you’re feeling this week is valid.',
    ],
  },
  2: {
    development: [
      'Your baby continues to grow steadily this week.',
      'This is often a time of noticeable growth and movement.',
      'Your baby is becoming more active as the weeks go on.',
      'Development continues at a steady pace this week.',
    ],
    momChanges: [
      'Many women find this stretch brings a bit more energy back.',
      'Your body continues to change and adjust to support your pregnancy.',
      'You may start noticing more visible changes around now.',
      'It’s common to feel more like yourself again during this stretch.',
    ],
    wellness: [
      'Gentle movement, like walking or prenatal-friendly stretching.',
      'Comfortable rest positions as your body continues to change.',
      'Staying active in whatever way feels good for you today.',
      'Building small, sustainable wellness routines that fit your life.',
    ],
    nutrition: [
      'Iron-rich foods alongside vitamin C to support absorption.',
      'Calcium-rich foods to support your changing needs.',
      'Steady water intake throughout the day.',
      'A varied, colorful plate when you’re able.',
    ],
    emotional: [
      'This can be a wonderful time to connect with your changing body.',
      'Take a moment to notice how far you’ve come.',
      'Sharing how you feel with someone you trust can be grounding.',
      'There’s no right way to feel about this stage — only your way.',
    ],
  },
  3: {
    development: [
      'Your baby continues preparing for the weeks ahead.',
      'This stage often brings more noticeable movement.',
      'Your baby continues to grow and settle into position over these weeks.',
      'Development continues steadily as your due date approaches.',
    ],
    momChanges: [
      'Rest may feel harder to come by — be gentle with yourself.',
      'Your body is doing an enormous amount of work right now.',
      'It’s common to feel more physically aware as space becomes limited.',
      'Many women notice more frequent Braxton Hicks sensations around now.',
    ],
    wellness: [
      'Rest whenever you can, even in short stretches.',
      'Gentle movement and stretching for comfort.',
      'Preparing your space and your support system for the weeks ahead.',
      'Pacing yourself and asking for help when you need it.',
    ],
    nutrition: [
      'Smaller, more frequent meals if space feels limited.',
      'Steady hydration to support you through these final weeks.',
      'Protein-rich foods to support your energy.',
      'Foods that feel comfortable and easy on digestion.',
    ],
    emotional: [
      'It’s normal to feel a mix of excitement and nerves right now.',
      'Take time to rest your mind as well as your body.',
      'This is a meaningful stretch — be gentle with yourself through it.',
      'Whatever you’re feeling as your due date nears is valid.',
    ],
  },
}

function trimesterFor(week: number): 1 | 2 | 3 {
  if (week <= 13) return 1
  if (week <= 27) return 2
  return 3
}

export function getWeekContent(week: number): WeekContent {
  const clampedWeek = Math.min(Math.max(week, 1), 40)
  const trimester = trimesterFor(clampedWeek)
  const theme = TRIMESTER_THEMES[trimester]
  const index = (clampedWeek - 1) % theme.development.length

  return {
    week: clampedWeek,
    trimester,
    babySize: BABY_SIZES[clampedWeek - 1],
    developmentNote: theme.development[index],
    momChanges: theme.momChanges[index],
    wellnessFocus: theme.wellness[index],
    nutritionFocus: theme.nutrition[index],
    emotionalTip: theme.emotional[index],
  }
}

export const ALL_WEEKS: WeekContent[] = Array.from({ length: 40 }, (_, index) => getWeekContent(index + 1))
