import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/Card'
import { useTodos } from '@/hooks/useTodos'
import { useHomeworkCount } from '@/hooks/useHomework'
import { useClasses } from '@/hooks/useClasses'
import { useCells, useSettings } from '@/hooks/useSchedule'
import { DEFAULT_PERIODS } from '@/domain/constants'
import { calcTodayRemaining } from '@/domain/services/scheduleStats'
import { dayjs, today, weekdayOf } from '@/utils/date'
import styles from './Home.module.css'

export default function TodaySummary() {
  const navigate = useNavigate()
  const todos = useTodos(today())
  const homeworkCount = useHomeworkCount('active')
  const classes = useClasses()
  const settings = useSettings()
  const cells = useCells(classes[0]?.id)

  const mySubjects = settings?.mySubjects ?? []
  const periods = settings?.periods ?? DEFAULT_PERIODS
  const weekday = weekdayOf(today())
  const todayCells = useMemo(
    () => cells.filter((c) => c.day === weekday && c.subject),
    [cells, weekday],
  )
  const progress = useMemo(
    () =>
      calcTodayRemaining(
        todayCells,
        periods,
        mySubjects,
        dayjs().format('HH:mm'),
      ),
    [todayCells, periods, mySubjects],
  )
  const shownSubjects = useMemo(
    () =>
      (mySubjects.length
        ? todayCells.filter((c) => mySubjects.includes(c.subject))
        : todayCells
      ).sort((a, b) => a.period - b.period),
    [todayCells, mySubjects],
  )

  const undone = todos.filter((t) => !t.done).length

  const items = [
    {
      emoji: '✅',
      label: '今日待办',
      value: `${todos.length - undone}/${todos.length}`,
      path: '/todos',
    },
    {
      emoji: '📝',
      label: '进行中作业',
      value: `${homeworkCount}`,
      path: '/homework',
    },
    {
      emoji: '📅',
      label: mySubjects.length ? '我的课程' : '今日课程',
      value: progress.total === 0 ? '0 节' : `剩 ${progress.remaining}/${progress.total} 节`,
      path: '/schedule',
    },
  ]

  return (
    <Card title="今日速览" emoji="☀️" tone="green">
      <div className={styles.summary}>
        {items.map((it) => (
          <button
            key={it.path + it.label}
            type="button"
            className={styles.summaryItem}
            onClick={() => navigate(it.path)}
          >
            <span className={styles.summaryEmoji}>{it.emoji}</span>
            <span className={styles.summaryValue}>{it.value}</span>
            <span className={styles.summaryLabel}>{it.label}</span>
          </button>
        ))}
      </div>
      <p className={styles.summarySubjects}>
        {progress.currentPeriod !== undefined && <b>现在第 {progress.currentPeriod} 节 · </b>}
        {shownSubjects.length > 0
          ? `今天：${shownSubjects.map((c) => c.subject).join(' · ')}`
          : '今天没有相关课程'}
      </p>
    </Card>
  )
}
