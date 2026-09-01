import { useMemo, useRef, useState } from 'react'
import Button, { Fab, IconButton } from '@/components/ui/Button'
import { Chip, Input } from '@/components/ui/Field'
import Empty from '@/components/Empty'
import { useTodos } from '@/hooks/useTodos'
import {
  clearDone,
  clearDoneByIds,
  createTodo,
  removeTodo,
  toggleTodo,
} from '@/domain/repositories/todos'
import { askConfirm } from '@/components/ui/confirm'
import TimePicker from '@/components/ui/TimePicker'
import { addDays, dayjs, formatHuman, today, weekDates } from '@/utils/date'
import type { Todo } from '@/domain/types'
import EditTodoModal from './EditTodoModal'
import styles from './Todos.module.css'

export default function Todos() {
  const [date, setDate] = useState(today())
  const [weekMode, setWeekMode] = useState(false)
  const [text, setText] = useState('')
  const [time, setTime] = useState('')
  const [editing, setEditing] = useState<Todo | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 「本周」始终锁定今天所在的周（周一至周日），不跟随 date，
  // 否则把日期翻到下周后，本周视图会变成下周、新加的待办也会落到范围外
  const todayStr = today()
  const weekDatesOfToday = useMemo(() => weekDates(todayStr, true), [todayStr])
  const week = useMemo(() => new Set(weekDatesOfToday), [weekDatesOfToday])
  const weekLabel = `本周 ${dayjs(weekDatesOfToday[0]).format('M/D')}–${dayjs(
    weekDatesOfToday[6],
  ).format('M/D')}`

  const todos = useTodos(weekMode ? undefined : date)
  const visible = useMemo(
    () => (weekMode ? todos.filter((t) => week.has(t.date)) : todos),
    [todos, weekMode, week],
  )
  const undone = visible.filter((t) => !t.done)
  const done = visible.filter((t) => t.done)

  async function handleAdd() {
    const title = text.trim()
    if (!title) return
    // 本周模式下统一记为今天，保证新增项一定落在当前显示范围内
    await createTodo({ title, date: weekMode ? today() : date, time: time || undefined })
    setText('')
    setTime('')
  }

  return (
    <div>
      <div className={styles.dateRow}>
        <Chip active={!weekMode} onClick={() => setWeekMode(false)}>
          📅 按天
        </Chip>
        <Chip active={weekMode} onClick={() => setWeekMode(true)}>
          🗓️ 本周
        </Chip>
        <span className={styles.human}>{weekMode ? weekLabel : formatHuman(date)}</span>
        {!weekMode && (
          <input
            type="date"
            className={styles.dateInput}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        )}
      </div>

      {weekMode && (
        <p className={styles.modeHint}>
          仅显示今天所在周的待办，新增将记为今天；查看其他日期请切换「📅 按天」
        </p>
      )}

      {!weekMode && (
        <div className={styles.quickRow}>
          {[-1, 1].map((n) => (
            <Chip key={n} onClick={() => setDate(addDays(date, n))}>
              {n < 0 ? '← 前一天' : '后一天 →'}
            </Chip>
          ))}
          <Chip onClick={() => setDate(today())}>回到今天</Chip>
        </div>
      )}

      <div className={styles.addRow}>
        <Input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="今天要做什么？回车添加"
        />
        <Button onClick={handleAdd} disabled={!text.trim()}>
          添加
        </Button>
      </div>

      <div className={styles.timeRow}>
        <span className={styles.timeLabel}>⏰ 开始时间（选填）</span>
        <TimePicker value={time} onChange={setTime} />
      </div>

      {visible.length === 0 ? (
        <Empty emoji="🌤️" text="这里空空的" hint="添加一条待办开始新的一天" />
      ) : (
        <>
          <ul className={styles.list}>
            {undone.map((t) => (
              <TodoRow
                key={t.id}
                todo={t}
                showDate={weekMode}
                onToggle={() => toggleTodo(t.id)}
                onEdit={() => setEditing(t)}
                onDelete={async () => {
                  const ok = await askConfirm({
                    title: '🗑️ 删除待办',
                    content: `确定删除待办「${t.title}」吗？`,
                    okText: '删除',
                    danger: true,
                  })
                  if (ok) await removeTodo(t.id)
                }}
              />
            ))}
          </ul>

          {done.length > 0 && (
            <>
              <div className={styles.doneHead}>
                <span>已完成 {done.length}</span>
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={async () => {
                    const ok = await askConfirm({
                      title: '🧹 清除已完成',
                      content: weekMode
                        ? '确定清除本周已完成的待办吗？'
                        : '确定清除当天已完成的待办吗？',
                      okText: '清除',
                      danger: true,
                    })
                    if (!ok) return
                    if (weekMode) {
                      await clearDoneByIds(done.map((t) => t.id))
                    } else {
                      await clearDone(date)
                    }
                  }}
                >
                  清除已完成
                </button>
              </div>
              <ul className={styles.list}>
                {done.map((t) => (
                  <TodoRow
                    key={t.id}
                    todo={t}
                    showDate={weekMode}
                    onToggle={() => toggleTodo(t.id)}
                    onEdit={() => setEditing(t)}
                    onDelete={async () => {
                      const ok = await askConfirm({
                        title: '🗑️ 删除待办',
                        content: `确定删除待办「${t.title}」吗？`,
                        okText: '删除',
                        danger: true,
                      })
                      if (ok) await removeTodo(t.id)
                    }}
                  />
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <EditTodoModal todo={editing} onClose={() => setEditing(null)} />
      <Fab onClick={() => inputRef.current?.focus()} />
    </div>
  )
}

function TodoRow({
  todo,
  showDate,
  onToggle,
  onEdit,
  onDelete,
}: {
  todo: Todo
  showDate: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <li className={`${styles.item} ${todo.done ? styles.itemDone : ''}`}>
      <button
        type="button"
        className={styles.check}
        onClick={onToggle}
        aria-label={todo.done ? '标记未完成' : '标记完成'}
        style={todo.done ? { background: 'var(--c-green)', borderColor: 'var(--c-green)' } : undefined}
      >
        {todo.done && '✓'}
      </button>
      <button type="button" className={styles.title} onClick={onEdit}>
        {showDate && <span className={styles.itemDate}>{formatHuman(todo.date)}</span>}
        {todo.time && <span className={styles.itemTime}>🕗 {todo.time}</span>}
        {todo.title}
      </button>
      <IconButton onClick={onDelete} title="删除">
        🗑️
      </IconButton>
    </li>
  )
}
