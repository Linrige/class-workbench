import { db } from '@/db/db'
import type { Student } from '@/domain/types'
import { uid } from '@/utils/id'

export async function listStudents(classId: string): Promise<Student[]> {
  return db.students.where('classId').equals(classId).sortBy('name')
}

export async function listStudentsOfClasses(classIds: string[]): Promise<Student[]> {
  if (!classIds.length) return []
  return db.students.where('classId').anyOf(classIds).sortBy('name')
}

export async function addStudent(
  classId: string,
  input: { name: string; no?: string; gender?: Student['gender']; groupName?: string },
): Promise<string> {
  const id = uid()
  await db.students.add({ id, classId, createdAt: Date.now(), ...input })
  return id
}

/** 批量添加（粘贴名单） */
export async function addStudentsBulk(classId: string, names: string[]): Promise<number> {
  const now = Date.now()
  const rows: Student[] = names.map((name) => ({ id: uid(), classId, name, createdAt: now }))
  await db.students.bulkAdd(rows)
  return rows.length
}

export async function updateStudent(id: string, patch: Partial<Student>): Promise<void> {
  await db.students.update(id, patch)
}

export async function removeStudent(id: string): Promise<void> {
  await removeStudents([id])
}

export async function removeStudents(ids: string[]): Promise<void> {
  if (!ids.length) return
  await db.transaction('rw', [db.students, db.homeworkRecords, db.attendance], async () => {
    for (const id of ids) {
      await db.homeworkRecords.where('studentId').equals(id).delete()
      await db.attendance.where('studentId').equals(id).delete()
    }
    await db.students.bulkDelete(ids)
  })
}
