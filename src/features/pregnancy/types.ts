export const PREGNANCY_MOOD_OPTIONS = [
  { value: 'great', label: 'Great' },
  { value: 'good', label: 'Good' },
  { value: 'okay', label: 'Okay' },
  { value: 'low', label: 'Low' },
  { value: 'difficult', label: 'Difficult' },
] as const

export type PregnancyMood = (typeof PREGNANCY_MOOD_OPTIONS)[number]['value']

export const PREGNANCY_ENERGY_OPTIONS = [
  { value: 'very_low', label: 'Very low' },
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'very_high', label: 'Very high' },
] as const

export type PregnancyEnergyLevel = (typeof PREGNANCY_ENERGY_OPTIONS)[number]['value']

export const PREGNANCY_SLEEP_OPTIONS = [
  { value: 'poor', label: 'Poor' },
  { value: 'fair', label: 'Fair' },
  { value: 'good', label: 'Good' },
  { value: 'excellent', label: 'Excellent' },
] as const

export type PregnancySleepQuality = (typeof PREGNANCY_SLEEP_OPTIONS)[number]['value']

export const SYMPTOM_OPTIONS = [
  { value: 'nausea', label: 'Nausea' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'backache', label: 'Backache' },
  { value: 'swelling', label: 'Swelling' },
  { value: 'heartburn', label: 'Heartburn' },
  { value: 'cramping', label: 'Cramping' },
  { value: 'headache', label: 'Headache' },
  { value: 'none', label: 'None today' },
] as const

export type Symptom = (typeof SYMPTOM_OPTIONS)[number]['value']

export const NUTRITION_HABIT_OPTIONS = [
  { value: 'water_goal', label: 'Water goal' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'protein', label: 'Protein' },
  { value: 'iron', label: 'Iron-rich foods' },
  { value: 'calcium', label: 'Calcium-rich foods' },
  { value: 'folic_acid', label: 'Folic acid' },
  { value: 'prenatal_vitamins', label: 'Prenatal vitamins' },
] as const

export type NutritionHabit = (typeof NUTRITION_HABIT_OPTIONS)[number]['value']

export const NOTE_MAX_LENGTH = 500

export interface PregnancyProfile {
  id: string
  dueDate: string
  preferredHospital: string | null
  emergencyContact: string | null
  supportPerson: string | null
  painManagementPreference: string | null
  birthPlanNotes: string | null
  createdAt: string
  updatedAt: string
}

export interface PregnancyEntry {
  id: string
  entryDate: string
  mood: PregnancyMood | null
  energyLevel: PregnancyEnergyLevel | null
  sleepQuality: PregnancySleepQuality | null
  waterIntakeGlasses: number | null
  exerciseMinutes: number | null
  weightKg: number | null
  bloodPressureSystolic: number | null
  bloodPressureDiastolic: number | null
  babyMovementNote: string | null
  symptoms: Symptom[]
  nutritionHabits: NutritionHabit[]
  reflection: string | null
  createdAt: string
  updatedAt: string
}

export const APPOINTMENT_TYPE_OPTIONS = [
  { value: 'doctor_visit', label: 'Doctor visit' },
  { value: 'ultrasound', label: 'Ultrasound' },
  { value: 'blood_test', label: 'Blood test' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'hospital_visit', label: 'Hospital visit' },
  { value: 'other', label: 'Other' },
] as const

export type AppointmentType = (typeof APPOINTMENT_TYPE_OPTIONS)[number]['value']

export interface PregnancyAppointment {
  id: string
  appointmentType: AppointmentType
  title: string
  appointmentDate: string
  appointmentTime: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

export const MILESTONE_TYPE_OPTIONS = [
  { value: 'first_trimester', label: 'First Trimester' },
  { value: 'second_trimester', label: 'Second Trimester' },
  { value: 'third_trimester', label: 'Third Trimester' },
  { value: 'first_kick', label: "Baby's First Kick" },
  { value: 'baby_shower', label: 'Baby Shower' },
  { value: 'hospital_bag_ready', label: 'Hospital Bag Ready' },
  { value: 'birth_plan_complete', label: 'Birth Plan Complete' },
  { value: 'custom', label: 'Custom Milestone' },
] as const

export type MilestoneType = (typeof MILESTONE_TYPE_OPTIONS)[number]['value']

export interface PregnancyMilestone {
  id: string
  milestoneType: MilestoneType
  title: string
  milestoneDate: string
  note: string | null
  createdAt: string
  updatedAt: string
}

export const CHECKLIST_CATEGORY_OPTIONS = [
  { value: 'nursery', label: 'Nursery' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'feeding', label: 'Feeding' },
  { value: 'travel', label: 'Travel' },
  { value: 'hospital_bag', label: 'Hospital Bag' },
  { value: 'other', label: 'Other' },
] as const

export type ChecklistCategory = (typeof CHECKLIST_CATEGORY_OPTIONS)[number]['value']

export interface PregnancyChecklistItem {
  id: string
  itemName: string
  category: ChecklistCategory
  isChecked: boolean
  createdAt: string
  updatedAt: string
}

export const STARTER_CHECKLIST_ITEMS: { itemName: string; category: ChecklistCategory }[] = [
  { itemName: 'Crib', category: 'nursery' },
  { itemName: 'Baby blanket', category: 'nursery' },
  { itemName: 'Clothes (newborn size)', category: 'clothing' },
  { itemName: 'Diapers', category: 'feeding' },
  { itemName: 'Feeding supplies', category: 'feeding' },
  { itemName: 'Baby monitor', category: 'nursery' },
  { itemName: 'Car seat', category: 'travel' },
  { itemName: 'Stroller', category: 'travel' },
  { itemName: 'Hospital bag packed', category: 'hospital_bag' },
]
