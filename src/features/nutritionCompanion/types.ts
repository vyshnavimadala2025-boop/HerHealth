export const MEAL_OPTIONS = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
] as const

export type MealValue = (typeof MEAL_OPTIONS)[number]['value']

export const FOOD_CATEGORY_OPTIONS = [
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'whole_grains', label: 'Whole grains' },
  { value: 'protein', label: 'Protein' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'processed_food', label: 'Processed food' },
] as const

export type FoodCategoryValue = (typeof FOOD_CATEGORY_OPTIONS)[number]['value']

export const NOTE_MAX_LENGTH = 500
export const MAX_HYDRATION_GLASSES = 30

export interface NutritionEntry {
  id: string
  entryDate: string
  mealsLogged: MealValue[]
  foodCategories: FoodCategoryValue[]
  hydrationGlasses: number | null
  note: string | null
  createdAt: string
  updatedAt: string
}
