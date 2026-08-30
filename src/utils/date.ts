import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

export const DATE_FMT = 'YYYY-MM-DD'

export function today(): string {
  return dayjs().format(DATE_FMT)
}

export function addDays(date: string, n: number): string {
  return dayjs(date).add(n, 'day').format(DATE_FMT)
}

/** 1 = 周一 ... 7 = 周日 */
export function weekdayOf(date: string): number {
  const d = dayjs(date).day()
  return d === 0 ? 7 : d
}

/** 本周（周一为起点）的日期数组，长度 5 或 7 */
export function weekDates(base: string, withWeekend = true): string[] {
  const d = dayjs(base)
  const offset = d.day() === 0 ? -6 : 1 - d.day()
  const monday = d.add(offset, 'day')
  return Array.from({ length: withWeekend ? 7 : 5 }, (_, i) =>
    monday.add(i, 'day').format(DATE_FMT),
  )
}

export function formatHuman(date: string): string {
  const d = dayjs(date)
  const t = dayjs()
  if (d.isSame(t, 'day')) return '今天'
  if (d.isSame(t.add(1, 'day'), 'day')) return '明天'
  if (d.isSame(t.subtract(1, 'day'), 'day')) return '昨天'
  return d.format('M月D日 ddd')
}

export { dayjs }
