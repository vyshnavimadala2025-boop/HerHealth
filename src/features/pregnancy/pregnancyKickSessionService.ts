import { supabase } from '@/lib/supabaseClient'
import type { PregnancyKickSession } from '@/features/pregnancy/types'

interface KickSessionRow {
  id: string
  started_at: string
  ended_at: string
  movement_count: number
  note: string | null
  created_at: string
  updated_at: string
}

const KICK_SESSION_COLUMNS = 'id, started_at, ended_at, movement_count, note, created_at, updated_at'

function mapRow(row: KickSessionRow): PregnancyKickSession {
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    movementCount: row.movement_count,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getKickSessions(userId: string): Promise<PregnancyKickSession[]> {
  const { data, error } = await supabase
    .from('pregnancy_kick_sessions')
    .select(KICK_SESSION_COLUMNS)
    .eq('user_id', userId)
    .order('started_at', { ascending: false })

  if (error) throw new Error('Unable to load your kick sessions. Please try again.')
  return (data ?? []).map(mapRow)
}

export interface KickSessionInput {
  startedAt: string
  endedAt: string
  movementCount: number
  note: string | null
}

export async function createKickSession(userId: string, input: KickSessionInput): Promise<PregnancyKickSession> {
  const { data, error } = await supabase
    .from('pregnancy_kick_sessions')
    .insert({
      user_id: userId,
      started_at: input.startedAt,
      ended_at: input.endedAt,
      movement_count: input.movementCount,
      note: input.note,
    })
    .select(KICK_SESSION_COLUMNS)
    .single()

  if (error) throw new Error('We could not save your kick session. Please try again.')
  return mapRow(data)
}

export async function deleteKickSession(sessionId: string): Promise<void> {
  const { error } = await supabase.from('pregnancy_kick_sessions').delete().eq('id', sessionId)
  if (error) throw new Error('We could not delete your kick session. Please try again.')
}
