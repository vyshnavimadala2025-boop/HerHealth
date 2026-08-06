import { supabase } from '@/lib/supabaseClient'
import type { MilestoneType, PregnancyMilestone } from '@/features/pregnancy/types'

interface MilestoneRow {
  id: string
  milestone_type: string
  title: string
  milestone_date: string
  note: string | null
  created_at: string
  updated_at: string
}

const MILESTONE_COLUMNS = 'id, milestone_type, title, milestone_date, note, created_at, updated_at'

function mapRow(row: MilestoneRow): PregnancyMilestone {
  return {
    id: row.id,
    milestoneType: row.milestone_type as MilestoneType,
    title: row.title,
    milestoneDate: row.milestone_date,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getPregnancyMilestones(userId: string): Promise<PregnancyMilestone[]> {
  const { data, error } = await supabase
    .from('pregnancy_milestones')
    .select(MILESTONE_COLUMNS)
    .eq('user_id', userId)
    .order('milestone_date', { ascending: false })

  if (error) throw new Error('Unable to load your milestones. Please try again.')
  return (data ?? []).map(mapRow)
}

export interface PregnancyMilestoneInput {
  milestoneType: MilestoneType
  title: string
  milestoneDate: string
  note: string | null
}

export async function createPregnancyMilestone(
  userId: string,
  input: PregnancyMilestoneInput,
): Promise<PregnancyMilestone> {
  const { data, error } = await supabase
    .from('pregnancy_milestones')
    .insert({
      user_id: userId,
      milestone_type: input.milestoneType,
      title: input.title,
      milestone_date: input.milestoneDate,
      note: input.note,
    })
    .select(MILESTONE_COLUMNS)
    .single()

  if (error) throw new Error('We could not save your milestone. Please try again.')
  return mapRow(data)
}

export async function deletePregnancyMilestone(milestoneId: string): Promise<void> {
  const { error } = await supabase.from('pregnancy_milestones').delete().eq('id', milestoneId)
  if (error) throw new Error('We could not delete your milestone. Please try again.')
}
