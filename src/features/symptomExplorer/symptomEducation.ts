import { diffInCalendarDays } from '@/features/periods/dateUtils'
import { SYMPTOM_OPTIONS, type SymptomEntry, type SymptomValue } from '@/features/symptomExplorer/types'

const HEALTHCARE_GUIDANCE = 'If this is persistent, severe, or concerning, consider discussing it with a healthcare professional.'

/**
 * Short, general, non-diagnostic educational context per symptom —
 * observational language only ("can relate to", "may be worth noticing"),
 * never a diagnosis or clinical claim. Every entry ends with the same
 * healthcare-guidance line so no symptom card ever implies a self-contained
 * medical answer.
 */
export const SYMPTOM_EDUCATION: Record<SymptomValue, string> = {
  fatigue: `Fatigue can relate to sleep, activity levels, stress, hydration, or many everyday factors. ${HEALTHCARE_GUIDANCE}`,
  headache: `Headaches are common and can relate to hydration, sleep, stress, screen time, or routine changes. ${HEALTHCARE_GUIDANCE}`,
  bloating: `Bloating can relate to diet, hydration, digestion, or the menstrual cycle for many people. ${HEALTHCARE_GUIDANCE}`,
  cramping: `Cramping is commonly associated with the menstrual cycle, but can have other everyday causes too. ${HEALTHCARE_GUIDANCE}`,
  nausea: `Nausea can relate to diet, stress, sleep, or many other everyday factors. ${HEALTHCARE_GUIDANCE}`,
  mood_changes: `Mood can shift with sleep, stress, routine, and hormonal patterns. ${HEALTHCARE_GUIDANCE}`,
  breast_tenderness: `Breast tenderness is commonly associated with the menstrual cycle for many people. ${HEALTHCARE_GUIDANCE}`,
  joint_pain: `Joint discomfort can relate to activity levels, rest, or everyday strain. ${HEALTHCARE_GUIDANCE}`,
  skin_changes: `Skin changes can relate to hormonal patterns, stress, sleep, or routine changes. ${HEALTHCARE_GUIDANCE}`,
  sleep_disturbance: `Sleep can be affected by routine, stress, environment, and many everyday factors. ${HEALTHCARE_GUIDANCE}`,
  appetite_changes: `Appetite can shift with stress, routine, sleep, and hormonal patterns. ${HEALTHCARE_GUIDANCE}`,
  hot_flashes: `A sudden feeling of warmth can relate to hormonal patterns, environment, or other everyday factors. ${HEALTHCARE_GUIDANCE}`,
  dizziness: `Dizziness can relate to hydration, sleep, blood pressure changes, or many other factors. ${HEALTHCARE_GUIDANCE}`,
  back_pain: `Back discomfort can relate to posture, activity levels, rest, or everyday strain. ${HEALTHCARE_GUIDANCE}`,
  other: `Not every symptom fits a category — recording it in your own words is still useful for spotting your own patterns over time. ${HEALTHCARE_GUIDANCE}`,
}

export function symptomLabel(value: SymptomValue): string {
  return SYMPTOM_OPTIONS.find((option) => option.value === value)?.label ?? value
}

export interface SymptomPattern {
  symptom: SymptomValue
  daysRecorded: number
  windowDays: number
}

/**
 * Honest frequency observations only — a plain count of how many of the
 * last `windowDays` days had this symptom recorded, nothing inferred
 * beyond that. No trend classification (increasing/decreasing) is applied
 * here: a symptom's frequency isn't the same kind of continuous score
 * classifyTrend was calibrated for, and framing sparse symptom logs as
 * "trending up/down" would read closer to a clinical trajectory claim
 * than this feature should ever make.
 */
export function buildSymptomPatterns(entries: SymptomEntry[], today: string, windowDays = 30): SymptomPattern[] {
  const recentEntries = entries.filter((entry) => {
    const daysAgo = diffInCalendarDays(today, entry.entryDate)
    return daysAgo >= 0 && daysAgo < windowDays
  })

  const daysBySymptom = new Map<SymptomValue, Set<string>>()
  for (const entry of recentEntries) {
    for (const symptom of entry.symptoms) {
      if (!daysBySymptom.has(symptom)) daysBySymptom.set(symptom, new Set())
      daysBySymptom.get(symptom)?.add(entry.entryDate)
    }
  }

  return Array.from(daysBySymptom.entries())
    .map(([symptom, days]) => ({ symptom, daysRecorded: days.size, windowDays }))
    .filter((pattern) => pattern.daysRecorded >= 2)
    .sort((a, b) => b.daysRecorded - a.daysRecorded)
    .slice(0, 5)
}
