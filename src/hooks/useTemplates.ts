import { useLiveQuery } from 'dexie-react-hooks'
import { listTemplates } from '@/domain/repositories/templates'

export function useTemplates() {
  return useLiveQuery(() => listTemplates(), [], [])
}
