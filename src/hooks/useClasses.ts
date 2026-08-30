import { useLiveQuery } from 'dexie-react-hooks'
import { listClasses } from '@/domain/repositories/classes'
import type { ClassEntity } from '@/domain/types'

export function useClasses(includeArchived = false): ClassEntity[] {
  return useLiveQuery(() => listClasses(includeArchived), [includeArchived], [] as ClassEntity[])
}
