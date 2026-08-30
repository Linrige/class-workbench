import { db } from '@/db/db'
import type { ScheduleCell, ScheduleDoodle, Stroke } from '@/domain/types'
import { uid } from '@/utils/id'

export async function listCells(classId: string): Promise<ScheduleCell[]> {
  return db.scheduleCells.where('classId').equals(classId).toArray()
}

/** 写入 / 更新一个格子；subject 与 note 同时为空则删除该格 */
export async function setCell(input: {
  classId: string
  day: number
  period: number
  subject: string
  note?: string
  color?: string
}): Promise<void> {
  const key = [input.classId, input.day, input.period]
  const exist = await db.scheduleCells.where('[classId+day+period]').equals(key).first()
  if (!input.subject.trim() && !input.note?.trim()) {
    if (exist) await db.scheduleCells.delete(exist.id)
    return
  }
  if (exist) {
    await db.scheduleCells.update(exist.id, {
      subject: input.subject,
      note: input.note,
      color: input.color,
    })
  } else {
    await db.scheduleCells.add({ id: uid(), ...input })
  }
}

export async function clearNotes(classId: string): Promise<void> {
  const cells = await listCells(classId)
  await db.scheduleCells.bulkPut(cells.map((c) => ({ ...c, note: undefined })))
}

export async function clearSubjects(classId: string): Promise<void> {
  await db.scheduleCells.where('classId').equals(classId).delete()
}

export async function getDoodle(classId: string): Promise<ScheduleDoodle | undefined> {
  return db.scheduleDoodles.where('classId').equals(classId).first()
}

export async function saveDoodle(classId: string, strokes: Stroke[]): Promise<void> {
  const exist = await getDoodle(classId)
  const now = Date.now()
  if (exist) {
    await db.scheduleDoodles.update(exist.id, { strokes, updatedAt: now })
  } else {
    await db.scheduleDoodles.add({ id: uid(), classId, strokes, updatedAt: now })
  }
}

export async function clearDoodle(classId: string): Promise<void> {
  await db.scheduleDoodles.where('classId').equals(classId).delete()
}
