import { supabase } from '@/lib/supabaseClient'
import type { PeriodRecord } from '@/features/periods/types'

interface PeriodRecordRow {
  id: string
  start_date: string
  end_date: string | null
  note: string | null
  created_at: string
  updated_at: string
}

const PERIOD_COLUMNS = 'id, start_date, end_date, note, created_at, updated_at'

function mapRow(row: PeriodRecordRow): PeriodRecord {
  return {
    id: row.id,
    startDate: row.start_date,
    endDate: row.end_date,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getPeriodRecords(userId: string): Promise<PeriodRecord[]> {
  const { data, error } = await supabase
    .from('period_records')
    .select(PERIOD_COLUMNS)
    .eq('user_id', userId)
    .order('start_date', { ascending: false })

  if (error) throw new Error('Unable to load your period history. Please try again.')
  return (data ?? []).map(mapRow)
}

export interface PeriodRecordInput {
  startDate: string
  endDate: string | null
  note: string | null
}

export async function createPeriodRecord(
  userId: string,
  input: PeriodRecordInput,
): Promise<PeriodRecord> {
  const { data, error } = await supabase
    .from('period_records')
    .insert({
      user_id: userId,
      start_date: input.startDate,
      end_date: input.endDate,
      note: input.note,
    })
    .select(PERIOD_COLUMNS)
    .single()

  if (error) throw new Error('We could not save your period record. Please try again.')
  return mapRow(data)
}

export async function updatePeriodRecord(
  recordId: string,
  input: PeriodRecordInput,
): Promise<PeriodRecord> {
  const { data, error } = await supabase
    .from('period_records')
    .update({
      start_date: input.startDate,
      end_date: input.endDate,
      note: input.note,
    })
    .eq('id', recordId)
    .select(PERIOD_COLUMNS)
    .single()

  if (error) throw new Error('We could not update your period record. Please try again.')
  return mapRow(data)
}

export async function deletePeriodRecord(recordId: string): Promise<void> {
  const { error } = await supabase.from('period_records').delete().eq('id', recordId)
  if (error) throw new Error('We could not delete your period record. Please try again.')
}
