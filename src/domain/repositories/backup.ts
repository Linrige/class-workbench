import { db } from '@/db/db'

export interface BackupFile {
  version: 1
  exportedAt: number
  data: Record<string, unknown[]>
}

export async function exportAll(): Promise<string> {
  const data: Record<string, unknown[]> = {}
  for (const table of db.tables) {
    data[table.name] = await table.toArray()
  }
  const file: BackupFile = { version: 1, exportedAt: Date.now(), data }
  return JSON.stringify(file, null, 2)
}

export async function importAll(json: string, mode: 'replace' | 'merge'): Promise<void> {
  const parsed = JSON.parse(json) as BackupFile
  if (!parsed?.data) throw new Error('备份文件格式不正确')
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      const rows = parsed.data[table.name]
      if (!rows?.length) continue
      if (mode === 'replace') {
        await table.clear()
        await table.bulkAdd(rows as never[])
      } else {
        await table.bulkPut(rows as never[])
      }
    }
  })
}

export async function clearAll(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear()
  })
}

export function downloadJSON(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
