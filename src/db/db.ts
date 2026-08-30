import Dexie, { type Table } from 'dexie'
import { ATTENDANCE_DEFAULTS_FLAG, DEFAULT_ATTENDANCE_SLOTS } from '@/domain/constants'
import { uid } from '@/utils/id'
import type {
  AttendanceRecord,
  AttendanceSlot,
  ClassEntity,
  ClassTemplate,
  Quote,
  HomeworkEntity,
  HomeworkRecord,
  Memo,
  ScheduleCell,
  ScheduleDoodle,
  SettingRow,
  Student,
  Todo,
} from '@/domain/types'

export class AppDB extends Dexie {
  classTemplates!: Table<ClassTemplate, string>
  classes!: Table<ClassEntity, string>
  students!: Table<Student, string>
  homework!: Table<HomeworkEntity, string>
  homeworkRecords!: Table<HomeworkRecord, string>
  todos!: Table<Todo, string>
  memos!: Table<Memo, string>
  scheduleCells!: Table<ScheduleCell, string>
  scheduleDoodles!: Table<ScheduleDoodle, string>
  attendance!: Table<AttendanceRecord, string>
  attendanceSlots!: Table<AttendanceSlot, string>
  quotes!: Table<Quote, string>
  settings!: Table<SettingRow, string>

  constructor() {
    super('child-control-system')
    this.version(1).stores({
      classTemplates: 'id, name, updatedAt',
      classes: 'id, name, archived, createdAt',
      students: 'id, classId, name, createdAt, [classId+name]',
      homework: 'id, title, status, createdAt, dueDate',
      homeworkRecords: 'id, homeworkId, studentId, status, [homeworkId+studentId]',
      todos: 'id, date, done, createdAt',
      memos: 'id, pinned, order, updatedAt',
      scheduleCells: 'id, classId, [classId+day+period]',
      scheduleDoodles: 'id, classId',
      settings: 'key',
    })

    // v2：新增考勤表；作业状态新增「订正」，原「缺交」由 2 迁移为 3
    // 注意：新表必须声明在新增版本上，否则已存在的数据库不会创建该表
    this.version(2)
      .stores({
        attendance: 'id, date, studentId, status, [date+studentId]',
      })
      .upgrade((tx) =>
        tx
          .table('homeworkRecords')
          .toCollection()
          .modify((rec: { status: number }) => {
            if (rec.status === 2) rec.status = 3
          }),
      )

    // v3：考勤增加「时段」维度（早操 / 早读 …），旧记录归入第一个默认时段
    this.version(3)
      .stores({
        attendanceSlots: 'id, order',
        attendance: 'id, date, slotId, studentId, status, [date+slotId+studentId]',
      })
      .upgrade(async (tx) => {
        const now = Date.now()
        const defaults = DEFAULT_ATTENDANCE_SLOTS.map((name, i) => ({
          id: uid(),
          name,
          order: i,
          createdAt: now,
        }))
        const slotsTable = tx.table('attendanceSlots')
        const existing = await slotsTable.count()
        if (existing === 0) await slotsTable.bulkAdd(defaults)
        const first = (await slotsTable.orderBy('order').first()) as
          | { id: string }
          | undefined
        await tx
          .table('attendance')
          .toCollection()
          .modify((rec: { slotId?: string }) => {
            if (!rec.slotId && first) rec.slotId = first.id
          })
      })

    // v4：默认时段精简为「早读」。删除名为「早操」且尚未记录任何考勤的时段；
    // 若用户已改名或已打卡，则保留，交由用户在设置中自行处理
    this.version(4).upgrade(async (tx) => {
      const slotsTable = tx.table('attendanceSlots')
      const slots = (await slotsTable.orderBy('order').toArray()) as {
        id: string
        name: string
        order: number
      }[]
      for (const slot of slots) {
        if (slot.name !== '早操') continue
        const used = await tx.table('attendance').where('slotId').equals(slot.id).count()
        if (used === 0) await slotsTable.delete(slot.id)
      }
      const left = (await slotsTable.orderBy('order').toArray()) as {
        id: string
        order: number
      }[]
      await slotsTable.bulkPut(left.map((s, i) => ({ ...s, order: i })))
    })

    // v5：合并同名重复时段（严格模式下 ensureDefaults 曾被并发执行，写入了重复默认值）。
    // 重复时段下的考勤记录会归并到保留的那个时段，随后写入标记阻止再次自动补默认值
    this.version(5).upgrade(async (tx) => {
      const slotsTable = tx.table('attendanceSlots')
      const slots = (await slotsTable.orderBy('order').toArray()) as {
        id: string
        name: string
        order: number
      }[]
      const keepByName = new Map<string, string>()
      const duplicates: { id: string; keepId: string }[] = []
      for (const s of slots) {
        const kept = keepByName.get(s.name)
        if (kept) duplicates.push({ id: s.id, keepId: kept })
        else keepByName.set(s.name, s.id)
      }
      if (duplicates.length) {
        const attTable = tx.table('attendance')
        for (const { id, keepId } of duplicates) {
          await attTable
            .where('slotId')
            .equals(id)
            .modify((rec: { slotId: string }) => {
              rec.slotId = keepId
            })
          await slotsTable.delete(id)
        }
      }
      const left = (await slotsTable.orderBy('order').toArray()) as {
        id: string
        order: number
      }[]
      await slotsTable.bulkPut(left.map((s, i) => ({ ...s, order: i })))
      await tx.table('settings').put({ key: ATTENDANCE_DEFAULTS_FLAG, value: true })
    })

    // v6：新增名言表（每日一言卡片），内容可在设置中增删
    this.version(6).stores({
      quotes: 'id, createdAt',
    })
  }
}

export const db = new AppDB()
