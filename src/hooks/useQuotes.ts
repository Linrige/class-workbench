import { useLiveQuery } from 'dexie-react-hooks'
import { listQuotes } from '@/domain/repositories/quotes'
import type { Quote } from '@/domain/types'

export function useQuotes(): Quote[] {
  return useLiveQuery(() => listQuotes(), [], [])
}
