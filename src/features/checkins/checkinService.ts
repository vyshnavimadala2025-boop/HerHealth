import { supabase } from '@/lib/supabaseClient'
import { getLocalDateString } from '@/features/checkins/types'
import type { CheckIn, EnergyLevel, Mood, Wellbeing } from '@/features/checkins/types'

interface CheckInRow {
  id: string
  checkin_date: string
  mood: string
  energy_level: string
  wellbeing: string
  note: string | null
  created_at: string
  updated_at: string
}

const CHECKIN_COLUMNS = 'id, checkin_date, mood, energy_level, wellbeing, note, created_at, updated_at'

function mapRow(row: CheckInRow): CheckIn {
  return {
    id: row.id,
    checkinDate: row.checkin_date,
    mood: row.mood as Mood,
    energyLevel: row.energy_level as EnergyLevel,
    wellbeing: row.wellbeing as Wellbeing,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getTodayCheckIn(userId: string): Promise<CheckIn | null> {
  const today = getLocalDateString()

  const { data, error } = await supabase
    .from('daily_checkins')
    .select(CHECKIN_COLUMNS)
    .eq('user_id', userId)
    .eq('checkin_date', today)
    .maybeSingle()

  if (error) throw new Error('Unable to load today’s check-in. Please try again.')
  return data ? mapRow(data) : null
}

export interface SaveCheckInInput {
  mood: Mood
  energyLevel: EnergyLevel
  wellbeing: Wellbeing
  note: string | null
}

export async function saveTodayCheckIn(userId: string, input: SaveCheckInInput): Promise<CheckIn> {
  const today = getLocalDateString()

  const { data, error } = await supabase
    .from('daily_checkins')
    .upsert(
      {
        user_id: userId,
        checkin_date: today,
        mood: input.mood,
        energy_level: input.energyLevel,
        wellbeing: input.wellbeing,
        note: input.note,
      },
      { onConflict: 'user_id,checkin_date' },
    )
    .select(CHECKIN_COLUMNS)
    .single()

  if (error) throw new Error('We could not save your check-in. Please try again.')
  return mapRow(data)
}

export async function getRecentCheckIns(userId: string, limit = 7): Promise<CheckIn[]> {
  const { data, error } = await supabase
    .from('daily_checkins')
    .select(CHECKIN_COLUMNS)
    .eq('user_id', userId)
    .order('checkin_date', { ascending: false })
    .limit(limit)

  if (error) throw new Error('Unable to load your recent check-ins. Please try again.')
  return (data ?? []).map(mapRow)
}

export interface CheckInCountRange {
  startDate?: string
  endDate?: string
}

/**
 * Count-only query (no rows fetched) for Phase 10 personal-progress and
 * goal-target summaries. Optionally windowed by local calendar date range.
 */
export async function getCheckInCount(
  userId: string,
  range: CheckInCountRange = {},
): Promise<number> {
  let query = supabase
    .from('daily_checkins')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (range.startDate) query = query.gte('checkin_date', range.startDate)
  if (range.endDate) query = query.lte('checkin_date', range.endDate)

  const { count, error } = await query
  if (error) throw new Error('Unable to load your check-in count. Please try again.')
  return count ?? 0
}

export interface CheckInsInRangeOptions {
  startDate?: string
  endDate?: string
}

/**
 * Full-row query (Phase 11 reports/timeline/export) — optionally windowed by
 * local calendar date range, ascending so chronological consumers (export,
 * timeline) don't need to re-sort.
 */
export async function getCheckInsInRange(
  userId: string,
  range: CheckInsInRangeOptions = {},
): Promise<CheckIn[]> {
  let query = supabase
    .from('daily_checkins')
    .select(CHECKIN_COLUMNS)
    .eq('user_id', userId)
    .order('checkin_date', { ascending: true })

  if (range.startDate) query = query.gte('checkin_date', range.startDate)
  if (range.endDate) query = query.lte('checkin_date', range.endDate)

  const { data, error } = await query
  if (error) throw new Error('Unable to load your check-ins. Please try again.')
  return (data ?? []).map(mapRow)
}
