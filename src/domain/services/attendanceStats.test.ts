import { describe, expect, it } from 'vitest'
import { buildStudentRanking } from './attendanceStats'
import type { AttendStatus } from '../types'

const students = [
  { id: 's1', name: '张三', classId: 'c1' },
  { id: 's2', name: '李四', classId: 'c1' },
  { id: 's3', name: '王五', classId: 'c1' },
  { id: 's4', name: '赵六', classId: 'c2' },
]

function rec(studentId: string, status: AttendStatus) {
  return { studentId, status }
}

describe('buildStudentRanking', () => {
  it('按异常次数降序排列', () => {
    const r = buildStudentRanking({
      records: [rec('s1', 1), rec('s1', 2), rec('s2', 1), rec('s3', 0)],
      students,
      classId: 'c1',
    })
    expect(r.rows.map((x) => x.name)).toEqual(['张三', '李四', '王五'])
    expect(r.rows[0].abnormal).toBe(2)
  })

  it('未登记的学生视为全勤，也会出现在列表中', () => {
    const r = buildStudentRanking({
      records: [rec('s1', 1)],
      students,
      classId: 'c1',
    })
    expect(r.rows).toHaveLength(3)
    const clean = r.rows.find((x) => x.name === '王五')!
    expect(clean.abnormal).toBe(0)
    expect(clean.recorded).toBe(0)
    expect(clean.rate).toBe(0)
  })

  it('请假与到达不计入异常，但计入记录数', () => {
    const r = buildStudentRanking({
      records: [rec('s1', 3), rec('s1', 0), rec('s1', 1)],
      students,
      classId: 'c1',
    })
    const row = r.rows.find((x) => x.name === '张三')!
    expect(row.abnormal).toBe(1)
    expect(row.leave).toBe(1)
    expect(row.present).toBe(1)
    expect(row.recorded).toBe(3)
    expect(row.rate).toBe(33)
  })

  it('缺勤多的排在迟到多之前', () => {
    const r = buildStudentRanking({
      records: [rec('s1', 1), rec('s1', 1), rec('s2', 2), rec('s2', 1)],
      students,
      classId: 'c1',
    })
    expect(r.rows[0].name).toBe('李四')
  })

  it('只统计指定班级的学生，并忽略孤立记录', () => {
    const r = buildStudentRanking({
      records: [rec('s1', 2), rec('s4', 2), rec('ghost', 2)],
      students,
      classId: 'c1',
    })
    expect(r.rows.map((x) => x.name)).not.toContain('赵六')
    expect(r.rows[0].name).toBe('张三')
    expect(r.rows[0].abnormal).toBe(1)
  })

  it('limit 限制返回条数', () => {
    const r = buildStudentRanking({
      records: [rec('s1', 2), rec('s2', 1), rec('s3', 1)],
      students,
      classId: 'c1',
      limit: 2,
    })
    expect(r.rows).toHaveLength(2)
  })
})
