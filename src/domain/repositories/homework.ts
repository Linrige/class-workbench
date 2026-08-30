import { db } from '@/db/db'
import type { HomeworkEntity, HomeworkRecord, SubmitStatus } from '@/domain/types'
import { uid } from '@/utils/id'
import { today } from '@/utils/date'
import { SUBMIT_CYCLE } from '@/domain/constants'
import { listStudentsOfClasses } from './students'

export async function listHomework(status?: HomeworkEntity['status']): Promise<HomeworkEntity[]> {
  const all = await db.homework.orderBy('createdAt').reverse().toArray()
  return status ? all.filter((h) => h.status === status) : all
}

export async function getHomework(id: string): Promise<HomeworkEntity | undefined> {
  return db.homework.get(id)
}

/** 布置作业：自动为所选班级的每个学生生成初始记录（待完成） */
export async function createHomework(input: {
  title: string
  classIds: string[]
  subject?: string
  dueDate?: string
  note?: string
}): Promise<string> {
  const id = uid()
  const now = Date.now()
  const students = await listStudentsOfClasses(input.classIds)
  const records: HomeworkRecord[] = students.map((s) => ({
    id: uid(),
    homeworkId: id,
    studentId: s.id,
    status: 0,
    updatedAt: now,
  }))
  await db.transaction('rw', [db.homework, db.homeworkRecords], async () => {
    await db.homework.add({
      id,
      title: input.title,
      classIds: input.classIds,
      subject: input.subject,
      assignDate: today(),
      dueDate: input.dueDate,
      note: input.note,
      status: 'active',
      createdAt: now,
    })
    await db.homeworkRecords.bulkAdd(records)
  })
  return id
}

export async function updateHomework(
  id: string,
  patch: Partial<Pick<HomeworkEntity, 'title' | 'subject' | 'dueDate' | 'note' | 'classIds' | 'status'>>,
): Promise<void> {
  await db.homework.update(id, patch)
}

/** 班级变化时同步补齐 / 移除学生记录 */
export async function syncRecords(homeworkId: string): Promise<void> {
  const hw = await db.homework.get(homeworkId)
  if (!hw) return
  const students = await listStudentsOfClasses(hw.classIds)
  const validIds = new Set(students.map((s) => s.id))
  const existing = await db.homeworkRecords.where('homeworkId').equals(homeworkId).toArray()
  const have = new Set(existing.map((r) => r.studentId))
  const now = Date.now()

  const toAdd: HomeworkRecord[] = students
    .filter((s) => !have.has(s.id))
    .map((s) => ({ id: uid(), homeworkId, studentId: s.id, status: 0, updatedAt: now }))
  const toDelete = existing.filter((r) => !validIds.has(r.studentId)).map((r) => r.id)

  await db.transaction('rw', db.homeworkRecords, async () => {
    if (toAdd.length) await db.homeworkRecords.bulkAdd(toAdd)
    if (toDelete.length) await db.homeworkRecords.bulkDelete(toDelete)
  })
}

export async function removeHomework(id: string): Promise<void> {
  await db.transaction('rw', [db.homework, db.homeworkRecords], async () => {
    await db.homeworkRecords.where('homeworkId').equals(id).delete()
    await db.homework.delete(id)
  })
}

export function nextStatus(cur: SubmitStatus): SubmitStatus {
  return SUBMIT_CYCLE[(SUBMIT_CYCLE.indexOf(cur) + 1) % SUBMIT_CYCLE.length]
}

/** 点击学生按钮：待完成 → 已完成 → 订正 → 缺交 → 待完成 */
export async function cycleRecord(homeworkId: string, studentId: string): Promise<SubmitStatus> {
  const exist = await db.homeworkRecords
    .where('[homeworkId+studentId]')
    .equals([homeworkId, studentId])
    .first()
  if (!exist) {
    const status: SubmitStatus = 1
    await db.homeworkRecords.add({
      id: uid(),
      homeworkId,
      studentId,
      status,
      updatedAt: Date.now(),
    })
    return status
  }
  const status = nextStatus(exist.status)
  await db.homeworkRecords.update(exist.id, { status, updatedAt: Date.now() })
  return status
}

export async function setRecord(
  homeworkId: string,
  studentId: string,
  status: SubmitStatus,
): Promise<void> {
  const exist = await db.homeworkRecords
    .where('[homeworkId+studentId]')
    .equals([homeworkId, studentId])
    .first()
  if (exist) {
    await db.homeworkRecords.update(exist.id, { status, updatedAt: Date.now() })
  } else {
    await db.homeworkRecords.add({
      id: uid(),
      homeworkId,
      studentId,
      status,
      updatedAt: Date.now(),
    })
  }
}

export async function markAllDone(homeworkId: string): Promise<void> {
  const records = await db.homeworkRecords.where('homeworkId').equals(homeworkId).toArray()
  const now = Date.now()
  await db.homeworkRecords.bulkPut(records.map((r) => ({ ...r, status: 1 as SubmitStatus, updatedAt: now })))
}

export async function listRecords(homeworkId: string): Promise<HomeworkRecord[]> {
  return db.homeworkRecords.where('homeworkId').equals(homeworkId).toArray()
}
