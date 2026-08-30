import type { AttendanceRecord, Student } from '../types'

export interface StudentAttendRow {
  studentId: string
  name: string
  present: number
  late: number
  absent: number
  leave: number
  /** 迟到 + 缺勤，即异常次数 */
  abnormal: number
  /** 已登记记录数 */
  recorded: number
  /** 异常占比 0-100 */
  rate: number
}

export interface StudentRanking {
  rows: StudentAttendRow[]
  /** 参与统计的记录数 */
  total: number
}

interface RankInput {
  records: Pick<AttendanceRecord, 'studentId' | 'status'>[]
  students: Pick<Student, 'id' | 'name' | 'classId'>[]
  classId: string
  /** 返回条数，0 表示全部 */
  limit?: number
}

/**
 * 单个班级的学生考勤排行。
 * 未登记的学生视为全勤，也会出现在列表中（各项为 0）。
 * 排序：异常次数降序 → 缺勤降序 → 迟到降序 → 姓名
 */
export function buildStudentRanking({
  records,
  students,
  classId,
  limit = 0,
}: RankInput): StudentRanking {
  const members = students.filter((s) => s.classId === classId)
  const counts = new Map<string, { p: number; l: number; a: number; v: number }>()

  for (const r of records) {
    const cur = counts.get(r.studentId) ?? { p: 0, l: 0, a: 0, v: 0 }
    if (r.status === 0) cur.p += 1
    else if (r.status === 1) cur.l += 1
    else if (r.status === 2) cur.a += 1
    else if (r.status === 3) cur.v += 1
    counts.set(r.studentId, cur)
  }

  const rows: StudentAttendRow[] = members.map((s) => {
    const c = counts.get(s.id) ?? { p: 0, l: 0, a: 0, v: 0 }
    const abnormal = c.l + c.a
    const recorded = c.p + c.l + c.a + c.v
    return {
      studentId: s.id,
      name: s.name,
      present: c.p,
      late: c.l,
      absent: c.a,
      leave: c.v,
      abnormal,
      recorded,
      rate: recorded === 0 ? 0 : Math.round((abnormal / recorded) * 100),
    }
  })

  rows.sort(
    (a, b) =>
      b.abnormal - a.abnormal ||
      b.absent - a.absent ||
      b.late - a.late ||
      a.name.localeCompare(b.name, 'zh-CN'),
  )

  return {
    rows: limit > 0 ? rows.slice(0, limit) : rows,
    total: records.length,
  }
}
