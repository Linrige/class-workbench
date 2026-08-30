import { useLiveQuery } from 'dexie-react-hooks'
import { listMemos } from '@/domain/repositories/memos'
import type { Memo } from '@/domain/types'

export function useMemos(): Memo[] {
  return useLiveQuery(() => listMemos(), [], [])
}
