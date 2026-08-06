import { supabase } from '@/lib/supabaseClient'
import type { AppointmentType, PregnancyAppointment } from '@/features/pregnancy/types'

interface AppointmentRow {
  id: string
  appointment_type: string
  title: string
  appointment_date: string
  appointment_time: string | null
  note: string | null
  created_at: string
  updated_at: string
}

const APPOINTMENT_COLUMNS = 'id, appointment_type, title, appointment_date, appointment_time, note, created_at, updated_at'

function mapRow(row: AppointmentRow): PregnancyAppointment {
  return {
    id: row.id,
    appointmentType: row.appointment_type as AppointmentType,
    title: row.title,
    appointmentDate: row.appointment_date,
    appointmentTime: row.appointment_time,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getPregnancyAppointments(userId: string): Promise<PregnancyAppointment[]> {
  const { data, error } = await supabase
    .from('pregnancy_appointments')
    .select(APPOINTMENT_COLUMNS)
    .eq('user_id', userId)
    .order('appointment_date', { ascending: true })

  if (error) throw new Error('Unable to load your appointments. Please try again.')
  return (data ?? []).map(mapRow)
}

export interface PregnancyAppointmentInput {
  appointmentType: AppointmentType
  title: string
  appointmentDate: string
  appointmentTime: string | null
  note: string | null
}

export async function createPregnancyAppointment(
  userId: string,
  input: PregnancyAppointmentInput,
): Promise<PregnancyAppointment> {
  const { data, error } = await supabase
    .from('pregnancy_appointments')
    .insert({
      user_id: userId,
      appointment_type: input.appointmentType,
      title: input.title,
      appointment_date: input.appointmentDate,
      appointment_time: input.appointmentTime,
      note: input.note,
    })
    .select(APPOINTMENT_COLUMNS)
    .single()

  if (error) throw new Error('We could not save your appointment. Please try again.')
  return mapRow(data)
}

export async function updatePregnancyAppointment(
  appointmentId: string,
  input: PregnancyAppointmentInput,
): Promise<PregnancyAppointment> {
  const { data, error } = await supabase
    .from('pregnancy_appointments')
    .update({
      appointment_type: input.appointmentType,
      title: input.title,
      appointment_date: input.appointmentDate,
      appointment_time: input.appointmentTime,
      note: input.note,
    })
    .eq('id', appointmentId)
    .select(APPOINTMENT_COLUMNS)
    .single()

  if (error) throw new Error('We could not update your appointment. Please try again.')
  return mapRow(data)
}

export async function deletePregnancyAppointment(appointmentId: string): Promise<void> {
  const { error } = await supabase.from('pregnancy_appointments').delete().eq('id', appointmentId)
  if (error) throw new Error('We could not delete your appointment. Please try again.')
}
