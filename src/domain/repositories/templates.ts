import { db } from '@/db/db'
import type { ClassTemplate } from '@/domain/types'
import { uid } from '@/utils/id'

export async function listTemplates(): Promise<ClassTemplate[]> {
  return db.classTemplates.orderBy('updatedAt').reverse().toArray()
}

export async function createTemplate(name: string, studentNames: string[]): Promise<string> {
  const now = Date.now()
  const id = uid()
  await db.classTemplates.add({ id, name, studentNames, createdAt: now, updatedAt: now })
  return id
}

export async function updateTemplate(
  id: string,
  patch: Partial<Pick<ClassTemplate, 'name' | 'studentNames'>>,
): Promise<void> {
  await db.classTemplates.update(id, { ...patch, updatedAt: Date.now() })
}

export async function removeTemplate(id: string): Promise<void> {
  await db.classTemplates.delete(id)
}

/** 把已有班级的学生名单另存为模板 */
export async function saveClassAsTemplate(classId: string, name: string): Promise<string> {
  const students = await db.students.where('classId').equals(classId).toArray()
  const names = students.map((s) => s.name)
  return createTemplate(name, names)
}
