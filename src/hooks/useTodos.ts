import { useLiveQuery } from 'dexie-react-hooks'
import { listTodos } from '@/domain/repositories/todos'
import type { Todo } from '@/domain/types'

export function useTodos(date?: string): Todo[] {
  return useLiveQuery(() => listTodos(date), [date], [])
}
