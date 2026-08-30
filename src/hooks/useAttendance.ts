import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/db'
import { listBySlot } from '@/domain/repositories/attendance'
import { listSlots } from '@/domain/repositories/attendanceSlots'
import type { AttendStatus, AttendanceSlot, ClassEntity, Student } from '@/domain/types'

export interface AttendanceItem {
  student: Student
  status: AttendStatus
  /** 是否已登记（未登记时显示默认「到达」，不可删除） */
  registered: boolean
}

export interface AttendanceGroup {
  classEntity: ClassEntity
  items: AttendanceItem[]
}

export function useAttendanceSlots(): AttendanceSlot[] {
  return useLiveQuery(() => listSlots(), [], [])
}

/** 某天某时段的考勤看板：按班级分组，未登记的学生默认为「到达」 */
export function useAttendanceBoard(date: string, slotId: string): AttendanceGroup[] {
  return useLiveQuery(
    async () => {
      if (!slotId) return []
      const [classes, students, records] = await Promise.all([
        db.classes.orderBy('createdAt').toArray(),
        db.students.toArray(),
        listBySlot(date, slotId),
      ])
      const active = classes.filter((c) => !c.archived)
      if (!active.length) return []
      const statusMap = new Map(records.map((r) => [r.studentId, r.status]))
      return active.map((classEntity) => ({
        classEntity,
        items: students
          .filter((s) => s.classId === classEntity.id)
          .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
          .map((student) => ({
            student,
            status: statusMap.get(student.id) ?? 0,
            registered: statusMap.has(student.id),
          })),
      }))
    },
    [date, slotId],
    [],
  )
}
