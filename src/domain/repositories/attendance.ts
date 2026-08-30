import { db } from '@/db/db'
import { ATTEND_CYCLE } from '@/domain/constants'
import type { AttendStatus, AttendanceRecord } from '@/domain/types'
import { uid } from '@/utils/id'
import { listStudents } from './students'

export async function listBySlot(date: string, slotId: string): Promise<AttendanceRecord[]> {
  return db.attendance.where('[date+slotId]').equals([date, slotId]).toArray()
}

export async function getRecord(
  date: string,
  slotId: string,
  studentId: string,
): Promise<AttendanceRecord | undefined> {
  return db.attendance
    .where('[date+slotId+studentId]')
    .equals([date, slotId, studentId])
    .first()
}

export async function setStatus(
  date: string,
  slotId: string,
  studentId: string,
  status: AttendStatus,
): Promise<void> {
  const exist = await getRecord(date, slotId, studentId)
  if (exist) {
    await db.attendance.update(exist.id, { status, updatedAt: Date.now() })
  } else {
    await db.attendance.add({
      id: uid(),
      date,
      slotId,
      studentId,
      status,
      updatedAt: Date.now(),
    })
  }
}

/** 点击学生按钮切换状态：无记录时默认为「到达」，点击后进入「迟到」 */
export async function cycleStatus(
  date: string,
  slotId: string,
  studentId: string,
): Promise<AttendStatus> {
  const exist = await getRecord(date, slotId, studentId)
  const cur: AttendStatus = exist?.status ?? 0
  const next = ATTEND_CYCLE[(ATTEND_CYCLE.indexOf(cur) + 1) % ATTEND_CYCLE.length]
  await setStatus(date, slotId, studentId, next)
  return next
}

/** 删除单个学生的考勤记录，恢复为默认「到达」 */
export async function deleteRecord(
  date: string,
  slotId: string,
  studentId: string,
): Promise<void> {
  await db.attendance
    .where('[date+slotId+studentId]')
    .equals([date, slotId, studentId])
    .delete()
}

/** 整个班级一键标记到达 */
export async function markAllPresent(
  date: string,
  slotId: string,
  classId: string,
): Promise<void> {
  const students = await listStudents(classId)
  const now = Date.now()
  await db.transaction('rw', db.attendance, async () => {
    for (const s of students) {
      const exist = await getRecord(date, slotId, s.id)
      if (exist) {
        await db.attendance.update(exist.id, { status: 0, updatedAt: now })
      } else {
        await db.attendance.add({
          id: uid(),
          date,
          slotId,
          studentId: s.id,
          status: 0,
          updatedAt: now,
        })
      }
    }
  })
}

/** 清空某天某时段的全部考勤记录 */
export async function clearSlot(date: string, slotId: string): Promise<void> {
  await db.attendance.where('[date+slotId]').equals([date, slotId]).delete()
}

/** 清空某天的全部考勤（所有时段） */
export async function clearDate(date: string): Promise<void> {
  await db.attendance.where('date').equals(date).delete()
}

export async function removeByStudent(studentId: string): Promise<void> {
  await db.attendance.where('studentId').equals(studentId).delete()
}

export async function removeBySlot(slotId: string): Promise<void> {
  await db.attendance.where('slotId').equals(slotId).delete()
}
