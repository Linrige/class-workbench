import { describe, expect, it } from 'vitest'
import { calcTodayRemaining } from './scheduleStats'
import type { PeriodConfig } from '../types'

const periods: PeriodConfig[] = [
  { index: 1, name: '第一节', startTime: '08:00', endTime: '08:45' },
  { index: 2, name: '第二节', startTime: '09:00', endTime: '09:45' },
  { index: 3, name: '第三节', startTime: '10:00', endTime: '10:45' },
]

const cells = [
  { subject: '语文', period: 1 },
  { subject: '数学', period: 2 },
  { subject: '英语', period: 3 },
]

describe('calcTodayRemaining', () => {
  it('未选择科目时统计全部课程', () => {
    const r = calcTodayRemaining(cells, periods, [], '07:00')
    expect(r.total).toBe(3)
    expect(r.remaining).toBe(3)
  })

  it('只统计所选科目', () => {
    const r = calcTodayRemaining(cells, periods, ['语文', '数学'], '07:00')
    expect(r.total).toBe(2)
    expect(r.remaining).toBe(2)
  })

  it('上午 8:30：第一节进行中，还剩 3 节（含当前）', () => {
    const r = calcTodayRemaining(cells, periods, [], '08:30')
    expect(r.remaining).toBe(3)
    expect(r.currentPeriod).toBe(1)
  })

  it('上午 8:50：第一节已结束，还剩 2 节', () => {
    const r = calcTodayRemaining(cells, periods, [], '08:50')
    expect(r.remaining).toBe(2)
  })

  it('全天课程结束后剩余为 0', () => {
    const r = calcTodayRemaining(cells, periods, [], '12:00')
    expect(r.remaining).toBe(0)
    expect(r.currentPeriod).toBeUndefined()
  })

  it('未配置时间的节次保守计入剩余', () => {
    const r = calcTodayRemaining(
      [{ subject: '语文', period: 1 }, { subject: '数学', period: 9 }],
      periods,
      [],
      '12:00',
    )
    expect(r.total).toBe(2)
    expect(r.remaining).toBe(1)
  })
})
