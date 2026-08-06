export const CERVICAL_MUCUS_OPTIONS = [
  { value: 'dry', label: 'Dry' },
  { value: 'sticky', label: 'Sticky' },
  { value: 'creamy', label: 'Creamy' },
  { value: 'watery', label: 'Watery' },
  { value: 'egg_white', label: 'Egg white' },
] as const

export type CervicalMucus = (typeof CERVICAL_MUCUS_OPTIONS)[number]['value']

export const OVULATION_TEST_OPTIONS = [
  { value: 'not_tested', label: 'Not tested' },
  { value: 'negative', label: 'Negative' },
  { value: 'positive', label: 'Positive' },
] as const

export type OvulationTestResult = (typeof OVULATION_TEST_OPTIONS)[number]['value']

export const FERTILITY_MOOD_OPTIONS = [
  { value: 'great', label: 'Great' },
  { value: 'good', label: 'Good' },
  { value: 'okay', label: 'Okay' },
  { value: 'low', label: 'Low' },
  { value: 'difficult', label: 'Difficult' },
] as const

export type FertilityMood = (typeof FERTILITY_MOOD_OPTIONS)[number]['value']

export const FERTILITY_ENERGY_OPTIONS = [
  { value: 'very_low', label: 'Very low' },
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'very_high', label: 'Very high' },
] as const

export type FertilityEnergyLevel = (typeof FERTILITY_ENERGY_OPTIONS)[number]['value']

export const QUALITY_SCALE_OPTIONS = [
  { value: 'poor', label: 'Poor' },
  { value: 'fair', label: 'Fair' },
  { value: 'good', label: 'Good' },
  { value: 'excellent', label: 'Excellent' },
] as const

export type QualityScale = (typeof QUALITY_SCALE_OPTIONS)[number]['value']

export const STRESS_LEVEL_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'very_high', label: 'Very high' },
] as const

export type StressLevel = (typeof STRESS_LEVEL_OPTIONS)[number]['value']

export const HABIT_OPTIONS = [
  { value: 'prenatal_vitamins', label: 'Prenatal vitamins' },
  { value: 'water_goal', label: 'Water intake goal' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'meditation', label: 'Meditation' },
  { value: 'healthy_meals', label: 'Healthy meals' },
  { value: 'reduced_caffeine', label: 'Reduced caffeine' },
  { value: 'reduced_alcohol', label: 'Reduced alcohol' },
  { value: 'sleep_goal', label: 'Sleep goal' },
] as const

export type FertilityHabit = (typeof HABIT_OPTIONS)[number]['value']

export const NOTE_MAX_LENGTH = 500

export interface FertilityEntry {
  id: string
  entryDate: string
  cervicalMucus: CervicalMucus | null
  bbtCelsius: number | null
  ovulationTest: OvulationTestResult | null
  mood: FertilityMood | null
  energyLevel: FertilityEnergyLevel | null
  sleepQuality: QualityScale | null
  stressLevel: StressLevel | null
  nutritionQuality: QualityScale | null
  waterIntakeGlasses: number | null
  exerciseMinutes: number | null
  intimacy: boolean
  habits: FertilityHabit[]
  note: string | null
  createdAt: string
  updatedAt: string
}
