import { db } from '@/db/db'
import type { ClassEntity, Student } from '@/domain/types'
import { uid } from '@/utils/id'

export async function listClasses(includeArchived = false): Promise<ClassEntity[]> {
  const all = await db.classes.orderBy('createdAt').toArray()
  return includeArchived ? all : all.filter((c) => !c.archived)
}

export async function getClass(id: string): Promise<ClassEntity | undefined> {
  return db.classes.get(id)
}

export async function createClass(input: {
  name: string
  grade?: string
  color: string
  templateId?: string
}): Promise<string> {
  const id = uid()
  await db.classes.add({
    id,
    name: input.name,
    grade: input.grade,
    color: input.color,
    templateId: input.templateId,
    archived: false,
    createdAt: Date.now(),
  })
  return id
}

export async function updateClass(id: string, patch: Partial<ClassEntity>): Promise<void> {
  await db.classes.update(id, patch)
}

/** 删除班级：级联清理学生、作业记录、课表、涂鸦 */
export async function removeClass(id: string): Promise<void> {
  const students = await db.students.where('classId').equals(id).toArray()
  const ids = students.map((s) => s.id)
  await db.transaction(
    'rw',
    [
      db.classes,
      db.students,
      db.homeworkRecords,
      db.attendance,
      db.scheduleCells,
      db.scheduleDoodles,
    ],
    async () => {
      for (const sid of ids) {
        await db.homeworkRecords.where('studentId').equals(sid).delete()
        await db.attendance.where('studentId').equals(sid).delete()
      }
      await db.students.where('classId').equals(id).delete()
      await db.scheduleCells.where('classId').equals(id).delete()
      await db.scheduleDoodles.where('classId').equals(id).delete()
      await db.classes.delete(id)
    },
  )
}

/** 从首页保存的班级模板一键生成班级 + 学生 */
export async function importFromTemplate(
  templateId: string,
  opts?: { name?: string; color?: string },
): Promise<string> {
  const tpl = await db.classTemplates.get(templateId)
  if (!tpl) throw new Error('模板不存在')
  const classId = uid()
  const now = Date.now()
  const students: Student[] = tpl.studentNames.map((name) => ({
    id: uid(),
    classId,
    name,
    createdAt: now,
  }))
  await db.transaction('rw', [db.classes, db.students], async () => {
    await db.classes.add({
      id: classId,
      name: opts?.name || tpl.name,
      color: opts?.color || 'pink',
      templateId: tpl.id,
      archived: false,
      createdAt: now,
    })
    await db.students.bulkAdd(students)
  })
  return classId
}

export async function countStudents(classId: string): Promise<number> {
  return db.students.where('classId').equals(classId).count()
}
