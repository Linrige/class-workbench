import { useLiveQuery } from 'dexie-react-hooks'
import { getDoodle, listCells } from '@/domain/repositories/schedule'
import { getSettings } from '@/domain/repositories/settings'
import type { AppSettings, ScheduleCell } from '@/domain/types'

export function useCells(classId?: string): ScheduleCell[] {
  return useLiveQuery(() => (classId ? listCells(classId) : Promise.resolve([])), [classId], [])
}

export function useDoodle(classId?: string) {
  return useLiveQuery(() => (classId ? getDoodle(classId) : Promise.resolve(undefined)), [classId])
}

export function useSettings(): AppSettings {
  return useLiveQuery(() => getSettings(), [], undefined as unknown as AppSettings)
}
