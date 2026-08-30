import { describe, expect, it } from 'vitest'
import { calcProgress, groupByStatus } from './homeworkStats'
import type { HomeworkRecord, SubmitStatus } from '../types'

function rec(status: SubmitStatus): HomeworkRecord {
  return { id: `${status}-${Math.random()}`, homeworkId: 'h', studentId: 's', status, updatedAt: 0 }
}

describe('calcProgress', () => {
  it('空记录返回 0%', () => {
    expect(calcProgress([])).toEqual({
      total: 0,
      done: 0,
      correction: 0,
      missing: 0,
      pending: 0,
      rate: 0,
    })
  })

  it('正确统计四种状态：已完成 / 订正 / 缺交 / 待完成', () => {
    const p = calcProgress([rec(1), rec(1), rec(2), rec(3), rec(0)])
    expect(p).toEqual({ total: 5, done: 2, correction: 1, missing: 1, pending: 1, rate: 40 })
  })

  it('订正不计入已完成率', () => {
    expect(calcProgress([rec(1), rec(2)]).rate).toBe(50)
  })

  it('全部完成时进度为 100%', () => {
    expect(calcProgress([rec(1), rec(1)]).rate).toBe(100)
  })
})

describe('groupByStatus', () => {
  it('按四种状态分组', () => {
    const g = groupByStatus([rec(0), rec(1), rec(2), rec(3), rec(1)])
    expect(g[0]).toHaveLength(1)
    expect(g[1]).toHaveLength(2)
    expect(g[2]).toHaveLength(1)
    expect(g[3]).toHaveLength(1)
  })
})
