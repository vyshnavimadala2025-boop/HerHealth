import { getLocalDateString } from '@/features/reports/dateRangePresets'
import type { CheckIn } from '@/features/checkins/types'
import type { PeriodRecord } from '@/features/periods/types'
import type { JournalEntry } from '@/features/journal/types'
import type { WellnessGoal, GoalProgressEntry } from '@/features/goals/types'
import type { ReminderPreference } from '@/features/reminders/types'
import type { PcosWellnessEntry } from '@/features/pcosWellness/types'
import type { SymptomEntry } from '@/features/symptomExplorer/types'
import type { SleepEntry } from '@/features/sleepIntelligence/types'
import type { NutritionEntry } from '@/features/nutritionCompanion/types'
import type { StressRecoveryEntry } from '@/features/stressRecovery/types'
import type { ScreeningItem } from '@/features/screeningPlanner/types'
import type { ExportBundle } from '@/features/reports/types'

export const EXPORT_DISCLAIMER =
  'These summaries are based only on the information you record in SIRILA and are not medical advice or a medical diagnosis.'

export interface ExportSourceData {
  checkIns: CheckIn[]
  periodRecords: PeriodRecord[]
  journalEntries: JournalEntry[]
  goals: WellnessGoal[]
  goalProgressEntries: GoalProgressEntry[]
  reminderPreferences: ReminderPreference[]
  pcosWellnessEntries: PcosWellnessEntry[] | null
  symptomEntries: SymptomEntry[]
  sleepEntries: SleepEntry[]
  nutritionEntries: NutritionEntry[]
  stressRecoveryEntries: StressRecoveryEntry[]
  screeningItems: ScreeningItem[]
}

/** Maps already-fetched, already-typed rows into the flat export shape. No Supabase calls here. */
export function buildExportBundle(source: ExportSourceData): ExportBundle {
  return {
    exportedAt: new Date().toISOString(),
    disclaimer: EXPORT_DISCLAIMER,
    checkIns: source.checkIns.map((entry) => ({
      checkinDate: entry.checkinDate,
      mood: entry.mood,
      energyLevel: entry.energyLevel,
      wellbeing: entry.wellbeing,
      note: entry.note,
    })),
    periodRecords: source.periodRecords.map((record) => ({
      startDate: record.startDate,
      endDate: record.endDate,
      note: record.note,
    })),
    journalEntries: source.journalEntries.map((entry) => ({
      entryDate: entry.entryDate,
      title: entry.title,
      content: entry.content,
    })),
    goals: source.goals.map((goal) => ({
      title: goal.title,
      category: goal.category,
      note: goal.note,
      targetCount: goal.targetCount,
      targetPeriod: goal.targetPeriod,
      status: goal.status,
      startDate: goal.startDate,
      targetDate: goal.targetDate,
      completedAt: goal.completedAt,
    })),
    goalProgressEntries: source.goalProgressEntries.map((entry) => ({
      goalId: entry.goalId,
      progressDate: entry.progressDate,
      note: entry.note,
    })),
    reminderPreferences: source.reminderPreferences.map((preference) => ({
      activityType: preference.activityType,
      enabled: preference.enabled,
      reminderTime: preference.reminderTime,
      reminderDays: preference.reminderDays,
    })),
    pcosWellnessEntries: source.pcosWellnessEntries
      ? source.pcosWellnessEntries.map((entry) => ({
          entryDate: entry.entryDate,
          observations: entry.observations,
          note: entry.note,
        }))
      : null,
    symptomEntries: source.symptomEntries.map((entry) => ({
      entryDate: entry.entryDate,
      symptoms: entry.symptoms,
      severity: entry.severity,
      timing: entry.timing,
      note: entry.note,
    })),
    sleepEntries: source.sleepEntries.map((entry) => ({
      entryDate: entry.entryDate,
      bedtime: entry.bedtime,
      wakeTime: entry.wakeTime,
      durationMinutes: entry.durationMinutes,
      quality: entry.quality,
      note: entry.note,
    })),
    nutritionEntries: source.nutritionEntries.map((entry) => ({
      entryDate: entry.entryDate,
      mealsLogged: entry.mealsLogged,
      foodCategories: entry.foodCategories,
      hydrationGlasses: entry.hydrationGlasses,
      note: entry.note,
    })),
    stressRecoveryEntries: source.stressRecoveryEntries.map((entry) => ({
      entryDate: entry.entryDate,
      stressLevel: entry.stressLevel,
      recoveryLevel: entry.recoveryLevel,
      recoveryActions: entry.recoveryActions,
      reflection: entry.reflection,
    })),
    screeningItems: source.screeningItems.map((item) => ({
      title: item.title,
      category: item.category,
      plannedDate: item.plannedDate,
      completedDate: item.completedDate,
      status: item.status,
      note: item.note,
    })),
  }
}

/** Quotes a CSV field only when needed, doubling any embedded quotes, per RFC 4180. */
export function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return ''
  const stringValue = Array.isArray(value) ? value.join('; ') : String(value)
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

function csvSection(title: string, rows: Record<string, unknown>[]): string {
  if (rows.length === 0) {
    return `## ${title}\n(no records)\n`
  }
  const columns = Object.keys(rows[0])
  const header = columns.map(escapeCsvField).join(',')
  const lines = rows.map((row) => columns.map((column) => escapeCsvField(row[column])).join(','))
  return `## ${title}\n${header}\n${lines.join('\n')}\n`
}

/**
 * One combined CSV file, sections separated by a blank line and a "##"
 * title row, since each category has a different set of columns and no
 * zip/archive library is available in this project.
 */
export function buildExportCsv(bundle: ExportBundle): string {
  const sections = [
    'SIRILA personal data export',
    `Exported at: ${bundle.exportedAt}`,
    bundle.disclaimer,
    '',
    csvSection('Check-ins', bundle.checkIns),
    csvSection('Period records', bundle.periodRecords),
    csvSection('Journal entries', bundle.journalEntries),
    csvSection('Wellness goals', bundle.goals),
    csvSection('Goal progress entries', bundle.goalProgressEntries),
    csvSection('Reminder preferences', bundle.reminderPreferences),
    csvSection('Symptom entries', bundle.symptomEntries),
    csvSection('Sleep entries', bundle.sleepEntries),
    csvSection('Nutrition entries', bundle.nutritionEntries),
    csvSection('Stress & recovery entries', bundle.stressRecoveryEntries),
    csvSection('Preventive screening plans', bundle.screeningItems),
  ]
  if (bundle.pcosWellnessEntries) {
    sections.push(csvSection('PCOS/PCOD wellness entries', bundle.pcosWellnessEntries))
  }
  return sections.join('\n')
}

export function buildExportJson(bundle: ExportBundle): string {
  return JSON.stringify(bundle, null, 2)
}

function triggerDownload(content: string, mimeType: string, filename: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** Builds the export bundle and triggers a local file download — nothing is ever sent to a server. */
export function downloadExport(format: 'json' | 'csv', source: ExportSourceData): void {
  const bundle = buildExportBundle(source)
  const dateStamp = getLocalDateString()
  if (format === 'json') {
    triggerDownload(buildExportJson(bundle), 'application/json', `sirila-export-${dateStamp}.json`)
  } else {
    triggerDownload(buildExportCsv(bundle), 'text/csv', `sirila-export-${dateStamp}.csv`)
  }
}
