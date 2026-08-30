import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/db'
import { listStudents, listStudentsOfClasses } from '@/domain/repositories/students'
import type { Student } from '@/domain/types'

export function useStudents(classId?: string): Student[] {
  return useLiveQuery(() => (classId ? listStudents(classId) : Promise.resolve([])), [classId], [])
}

export function useStudentsOfClasses(classIds: string[]): Student[] {
  const key = classIds.join(',')
  return useLiveQuery(() => listStudentsOfClasses(classIds), [key], [])
}

/** 各班级人数 { classId: count } */
export function useStudentCounts(): Record<string, number> {
  return useLiveQuery(
    async () => {
      const all = await db.students.toArray()
      const map: Record<string, number> = {}
      for (const s of all) map[s.classId] = (map[s.classId] ?? 0) + 1
      return map
    },
    [],
    {},
  )
}
