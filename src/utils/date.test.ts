import { describe, expect, it } from 'vitest'
import { addDays, formatHuman, today, weekDates, weekdayOf } from './date'
import { parseNames } from './names'

describe('weekdayOf', () => {
  it('周一为 1，周日为 7', () => {
    expect(weekdayOf('2026-08-31')).toBe(1) // 周一
    expect(weekdayOf('2026-09-06')).toBe(7) // 周日
  })
})

describe('weekDates', () => {
  it('以周一为起点，默认返回 5 天', () => {
    const dates = weekDates('2026-09-03', false) // 周四
    expect(dates).toHaveLength(5)
    expect(weekdayOf(dates[0])).toBe(1)
    expect(dates[0]).toBe('2026-08-31')
  })

  it('周日不会落到下一周', () => {
    const dates = weekDates('2026-09-06', true)
    expect(dates[0]).toBe('2026-08-31')
    expect(dates).toHaveLength(7)
  })

  it('含周末时，周六与周日都在本周范围内', () => {
    const dates = weekDates('2026-08-30', true) // 周日
    expect(dates).toHaveLength(7)
    expect(dates[0]).toBe('2026-08-24') // 周一
    expect(dates).toContain('2026-08-29') // 周六
    expect(dates).toContain('2026-08-30') // 周日
  })
})

describe('addDays / formatHuman', () => {
  it('日期加减正确', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01')
    expect(addDays('2026-09-01', -1)).toBe('2026-08-31')
  })

  it('今天显示为「今天」', () => {
    expect(formatHuman(today())).toBe('今天')
    expect(formatHuman(addDays(today(), 1))).toBe('明天')
  })
})

describe('parseNames', () => {
  it('支持换行、逗号、顿号混合', () => {
    expect(parseNames('张三\n李四，王五、赵六')).toEqual(['张三', '李四', '王五', '赵六'])
  })

  it('忽略空白项', () => {
    expect(parseNames('  张三  \n\n  ')).toEqual(['张三'])
  })
})
