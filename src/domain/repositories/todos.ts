import { db } from '@/db/db'
import type { Priority, Todo } from '@/domain/types'
import { uid } from '@/utils/id'

export async function listTodos(date?: string): Promise<Todo[]> {
  const all = await db.todos.orderBy('createdAt').toArray()
  const filtered = date ? all.filter((t) => t.date === date) : all
  return filtered.sort(
    (a, b) => Number(a.done) - Number(b.done) || b.priority - a.priority || a.createdAt - b.createdAt,
  )
}

export async function createTodo(input: {
  title: string
  date: string
  priority?: Priority
}): Promise<string> {
  const id = uid()
  await db.todos.add({
    id,
    title: input.title,
    date: input.date,
    priority: input.priority ?? 1,
    done: false,
    createdAt: Date.now(),
  })
  return id
}

export async function updateTodo(id: string, patch: Partial<Todo>): Promise<void> {
  await db.todos.update(id, patch)
}

export async function toggleTodo(id: string): Promise<void> {
  const t = await db.todos.get(id)
  if (!t) return
  await db.todos.update(id, {
    done: !t.done,
    doneAt: !t.done ? Date.now() : undefined,
  })
}

export async function removeTodo(id: string): Promise<void> {
  await db.todos.delete(id)
}

export async function clearDone(date?: string): Promise<void> {
  const rows = await db.todos.filter((t) => t.done && (!date || t.date === date)).toArray()
  await db.todos.bulkDelete(rows.map((r) => r.id))
}

/** 按 id 精确清除（用于「本周」这类跨日期范围） */
export async function clearDoneByIds(ids: string[]): Promise<void> {
  if (!ids.length) return
  await db.todos.bulkDelete(ids)
}
