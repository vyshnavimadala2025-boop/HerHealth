export const NOTE_MAX_LENGTH = 500

export interface PeriodRecord {
  id: string
  startDate: string
  endDate: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}
