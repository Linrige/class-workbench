import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/db'
import { buildStudentRanking, type StudentRanking } from '@/domain/services/attendanceStats'
import { dayjs, today, weekDates } from '@/utils/date'

export type RankRange = 'week' | 'month' | 'all'

function startDateOf(range: RankRange): string | null {
  if (range === 'week') return weekDates(today(), false)[0]
  if (range === 'month') return dayjs().startOf('month').format('YYYY-MM-DD')
  return null
}

const EMPTY: StudentRanking = { rows: [], total: 0 }

/** 某个班级在指定时间范围内的学生考勤排行 */
export function useAttendanceRanking(range: RankRange, classId: string): StudentRanking {
  return useLiveQuery(
    async () => {
      if (!classId) return EMPTY
      const start = startDateOf(range)
      const [records, students] = await Promise.all([
        start
          ? db.attendance.where('date').aboveOrEqual(start).toArray()
          : db.attendance.toArray(),
        db.students.where('classId').equals(classId).toArray(),
      ])
      if (!students.length) return EMPTY
      return buildStudentRanking({ records, students, classId })
    },
    [range, classId],
    EMPTY,
  )
}
