import type { PeriodConfig, ScheduleCell } from '../types'

export interface TodayProgress {
  /** 我今天的课程总节数 */
  total: number
  /** 还没下课的节数（含正在上的） */
  remaining: number
  /** 当前时间所在的节次（按节次时间表计算），不在任何节次内为 undefined */
  currentPeriod?: number
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((v) => Number.parseInt(v, 10))
  return (Number.isNaN(h) ? 0 : h) * 60 + (Number.isNaN(m) ? 0 : m)
}

/**
 * 计算今天「还剩几节课」。
 * @param cells 今天这一天的课表格子（只取当天）
 * @param periods 节次时间表
 * @param mySubjects 我任教的科目；为空数组时统计全部课程
 * @param nowHHmm 当前时间 HH:mm
 */
export function calcTodayRemaining(
  cells: Pick<ScheduleCell, 'subject' | 'period'>[],
  periods: PeriodConfig[],
  mySubjects: string[],
  nowHHmm: string,
): TodayProgress {
  const periodMap = new Map(periods.map((p) => [p.index, p]))
  const now = toMinutes(nowHHmm)
  const mine = cells.filter(
    (c) => Boolean(c.subject) && (mySubjects.length === 0 || mySubjects.includes(c.subject)),
  )

  let remaining = 0
  for (const c of mine) {
    const p = periodMap.get(c.period)
    // 节次未配置时间时，保守视为还没上
    if (!p || toMinutes(p.endTime) > now) remaining += 1
  }

  const currentPeriod = periods.find(
    (p) => now >= toMinutes(p.startTime) && now <= toMinutes(p.endTime),
  )?.index

  return { total: mine.length, remaining, currentPeriod }
}
