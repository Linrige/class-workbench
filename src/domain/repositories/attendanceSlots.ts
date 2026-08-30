import { db } from '@/db/db'
import { ATTENDANCE_DEFAULTS_FLAG, DEFAULT_ATTENDANCE_SLOTS } from '@/domain/constants'
import type { AttendanceSlot } from '@/domain/types'
import { uid } from '@/utils/id'
import { removeBySlot } from './attendance'

export async function listSlots(): Promise<AttendanceSlot[]> {
  return db.attendanceSlots.orderBy('order').toArray()
}

let ensurePromise: Promise<void> | null = null

/**
 * 首次使用时补齐默认时段。
 * 用标记 + 事务双重保护，避免严格模式下 effect 执行两次导致写入重复默认值。
 */
export function ensureDefaults(): Promise<void> {
  if (ensurePromise) return ensurePromise
  ensurePromise = (async () => {
    const flag = await db.settings.get(ATTENDANCE_DEFAULTS_FLAG)
    if (flag) return
    await db.transaction('rw', [db.attendanceSlots, db.settings], async () => {
      const again = await db.settings.get(ATTENDANCE_DEFAULTS_FLAG)
      if (again) return
      const count = await db.attendanceSlots.count()
      if (count === 0) {
        const now = Date.now()
        await db.attendanceSlots.bulkAdd(
          DEFAULT_ATTENDANCE_SLOTS.map((name, i) => ({
            id: uid(),
            name,
            order: i,
            createdAt: now,
          })),
        )
      }
      await db.settings.put({ key: ATTENDANCE_DEFAULTS_FLAG, value: true })
    })
  })()
  return ensurePromise
}

export async function createSlot(name: string): Promise<string> {
  const max = await db.attendanceSlots.count()
  const id = uid()
  await db.attendanceSlots.add({
    id,
    name: name.trim(),
    order: max,
    createdAt: Date.now(),
  })
  return id
}

export async function updateSlot(id: string, patch: Partial<AttendanceSlot>): Promise<void> {
  await db.attendanceSlots.update(id, patch)
}

/** 删除时段，同时删除该时段下所有考勤记录 */
export async function removeSlot(id: string): Promise<void> {
  await db.transaction('rw', [db.attendanceSlots, db.attendance], async () => {
    await removeBySlot(id)
    await db.attendanceSlots.delete(id)
  })
  await reorder()
}

/** 上移 / 下移 */
export async function moveSlot(id: string, direction: -1 | 1): Promise<void> {
  const slots = await listSlots()
  const index = slots.findIndex((s) => s.id === id)
  const target = index + direction
  if (index < 0 || target < 0 || target >= slots.length) return
  const swapped = [...slots]
  ;[swapped[index], swapped[target]] = [swapped[target], swapped[index]]
  await db.attendanceSlots.bulkPut(
    swapped.map((s, i) => ({ ...s, order: i })),
  )
}

/** 重新排列 order，保证连续 */
async function reorder(): Promise<void> {
  const slots = await listSlots()
  await db.attendanceSlots.bulkPut(slots.map((s, i) => ({ ...s, order: i })))
}
