import type { HomeworkRecord, SubmitStatus } from '../types'

export interface Progress {
  total: number
  done: number
  correction: number
  missing: number
  pending: number
  /** 已完成占比 0-100 */
  rate: number
}

export function calcProgress(records: Pick<HomeworkRecord, 'status'>[]): Progress {
  const total = records.length
  const done = records.filter((r) => r.status === 1).length
  const correction = records.filter((r) => r.status === 2).length
  const missing = records.filter((r) => r.status === 3).length
  const pending = total - done - correction - missing
  return {
    total,
    done,
    correction,
    missing,
    pending,
    rate: total === 0 ? 0 : Math.round((done / total) * 100),
  }
}

export function groupByStatus(
  records: HomeworkRecord[],
): Record<SubmitStatus, HomeworkRecord[]> {
  return records.reduce(
    (acc, r) => {
      acc[r.status].push(r)
      return acc
    },
    { 0: [], 1: [], 2: [], 3: [] } as Record<SubmitStatus, HomeworkRecord[]>,
  )
}
