import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/db'
import { listHomework, listRecords } from '@/domain/repositories/homework'
import { getClass } from '@/domain/repositories/classes'
import { listStudentsOfClasses } from '@/domain/repositories/students'
import type { ClassEntity, HomeworkEntity, Student, SubmitStatus } from '@/domain/types'

export interface BoardItem {
  student: Student
  status: SubmitStatus
}

export interface BoardGroup {
  classEntity: ClassEntity
  items: BoardItem[]
}

export interface HomeworkBoard {
  homework: HomeworkEntity
  groups: BoardGroup[]
}

export function useHomework(status?: HomeworkEntity['status']): HomeworkEntity[] {
  return useLiveQuery(() => listHomework(status), [status], [])
}

/** 作业模块主数据：作业 → 班级分组 → 学生状态 */
export function useHomeworkBoard(status: HomeworkEntity['status'] = 'active'): HomeworkBoard[] {
  return useLiveQuery(
    async () => {
      const list = await listHomework(status)
      if (!list.length) return []
      const classIds = [...new Set(list.flatMap((h) => h.classIds))]
      const [students, recordRows] = await Promise.all([
        listStudentsOfClasses(classIds),
        Promise.all(list.map((h) => listRecords(h.id))),
      ])
      const classCache = new Map<string, ClassEntity | undefined>()
      for (const cid of classIds) classCache.set(cid, await getClass(cid))

      return list.map((hw, i) => {
        const statusMap = new Map(recordRows[i].map((r) => [r.studentId, r.status]))
        const groups: BoardGroup[] = []
        for (const cid of hw.classIds) {
          const classEntity = classCache.get(cid)
          if (!classEntity) continue
          const items: BoardItem[] = students
            .filter((s) => s.classId === cid)
            .map((s) => ({ student: s, status: statusMap.get(s.id) ?? 0 }))
          groups.push({ classEntity, items })
        }
        return { homework: hw, groups }
      })
    },
    [status],
    [],
  )
}

export function useHomeworkCount(status: HomeworkEntity['status'] = 'active'): number {
  return useLiveQuery(() => db.homework.where('status').equals(status).count(), [status], 0)
}
