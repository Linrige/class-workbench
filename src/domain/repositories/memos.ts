import { db } from '@/db/db'
import type { Memo } from '@/domain/types'
import { uid } from '@/utils/id'

export async function listMemos(): Promise<Memo[]> {
  const all = await db.memos.orderBy('order').toArray()
  return all.sort((a, b) => Number(b.pinned) - Number(a.pinned) || a.order - b.order)
}

export async function createMemo(content: string, color = 'yellow'): Promise<string> {
  const now = Date.now()
  const max = await db.memos.count()
  const id = uid()
  await db.memos.add({
    id,
    content,
    color,
    pinned: false,
    order: max,
    createdAt: now,
    updatedAt: now,
  })
  return id
}

export async function updateMemo(id: string, patch: Partial<Memo>): Promise<void> {
  await db.memos.update(id, { ...patch, updatedAt: Date.now() })
}

export async function removeMemo(id: string): Promise<void> {
  await db.memos.delete(id)
}

export async function togglePin(id: string): Promise<void> {
  const m = await db.memos.get(id)
  if (m) await db.memos.update(id, { pinned: !m.pinned })
}
