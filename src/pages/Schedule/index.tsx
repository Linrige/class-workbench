import { Fragment, useEffect, useMemo, useState } from 'react'
import Button from '@/components/ui/Button'
import { Chip } from '@/components/ui/Field'
import Empty from '@/components/Empty'
import { useClasses } from '@/hooks/useClasses'
import { useCells, useDoodle, useSettings } from '@/hooks/useSchedule'
import { useUIStore } from '@/stores/uiStore'
import { useToastStore } from '@/stores/toastStore'
import { askConfirm } from '@/components/ui/confirm'
import { DEFAULT_PERIODS, softOf, valueOf } from '@/domain/constants'
import {
  clearDoodle,
  clearNotes,
  clearSubjects,
  saveDoodle,
} from '@/domain/repositories/schedule'
import type { ScheduleCell, Stroke } from '@/domain/types'
import DoodleLayer from './DoodleLayer'
import CellModal from './CellModal'
import styles from './Schedule.module.css'

const WEEK = ['一', '二', '三', '四', '五', '六', '日']
const PEN_COLORS = ['#ff8fa3', '#6fc8e8', '#ffc94d', '#7bd88f', '#b79bff']
const PEN_WIDTHS = [2, 4, 8]

export default function Schedule() {
  const classes = useClasses()
  const settings = useSettings()
  const { scheduleClassId, setScheduleClassId } = useUIStore()
  const show = useToastStore((s) => s.show)

  const classId = scheduleClassId && classes.some((c) => c.id === scheduleClassId)
    ? scheduleClassId
    : classes[0]?.id

  const cells = useCells(classId)
  const doodle = useDoodle(classId)

  const [doodleMode, setDoodleMode] = useState(false)
  const [penColor, setPenColor] = useState(PEN_COLORS[0])
  const [penWidth, setPenWidth] = useState(PEN_WIDTHS[1])
  const [eraser, setEraser] = useState(false)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [editing, setEditing] = useState<{ day: number; period: number } | null>(null)
  const [tip, setTip] = useState<{
    text: string
    top: number
    left: number
    placement: 'top' | 'bottom'
  } | null>(null)

  /** 悬浮备注：fixed 定位 + 自动上下翻转，避免被顶部或容器裁剪 */
  function showTip(e: React.MouseEvent<HTMLButtonElement>, text: string) {
    const r = e.currentTarget.getBoundingClientRect()
    const placement: 'top' | 'bottom' = r.top > 160 ? 'top' : 'bottom'
    const margin = 130
    const left = Math.min(Math.max(r.left + r.width / 2, margin), window.innerWidth - margin)
    setTip({
      text,
      top: placement === 'top' ? r.top - 12 : r.bottom + 12,
      left,
      placement,
    })
  }

  function hideTip() {
    setTip(null)
  }

  const periods = settings?.periods ?? DEFAULT_PERIODS
  const showWeekend = settings?.showWeekend ?? false
  const days = useMemo(() => (showWeekend ? 7 : 5), [showWeekend])

  useEffect(() => {
    setStrokes(doodle?.strokes ?? [])
  }, [doodle])

  const cellMap = useMemo(() => {
    const map = new Map<string, ScheduleCell>()
    for (const c of cells) map.set(`${c.day}-${c.period}`, c)
    return map
  }, [cells])

  function commit(next: Stroke[]) {
    setStrokes(next)
    if (classId) void saveDoodle(classId, next)
  }

  if (classes.length === 0) {
    return (
      <Empty emoji="🏫" text="还没有班级" hint="先去「学生」模块创建班级，再回来排课表" />
    )
  }

  return (
    <div>
      <div className={styles.classRow}>
        {classes.map((c) => (
          <Chip key={c.id} active={c.id === classId} onClick={() => setScheduleClassId(c.id)}>
            {c.name}
          </Chip>
        ))}
      </div>

      <div className={styles.toolRow}>
        <Chip active={doodleMode} onClick={() => { setDoodleMode((v) => !v); setEraser(false) }}>
          ✏️ 涂鸦
        </Chip>
        <Chip
          onClick={async () => {
            if (!classId) return
            const ok = await askConfirm({
              title: '🧹 清除备注',
              content: '确定清除这张课表上的所有备注吗？课程会保留。',
              okText: '清除',
              danger: true,
            })
            if (!ok) return
            await clearNotes(classId)
            show('备注已清除', '🧹')
          }}
        >
          🧹 清除备注
        </Chip>
        <Chip
          onClick={async () => {
            if (!classId) return
            const ok = await askConfirm({
              title: '🧽 清除涂鸦',
              content: '确定清除这张课表上的所有涂鸦吗？',
              okText: '清除',
              danger: true,
            })
            if (!ok) return
            await clearDoodle(classId)
            setStrokes([])
            show('涂鸦已清除', '🧹')
          }}
        >
          🧽 清除涂鸦
        </Chip>
        <Chip
          onClick={async () => {
            if (!classId) return
            const ok = await askConfirm({
              title: '🗑️ 清空课程',
              content: '确定清空整张课表的课程吗？备注与涂鸦会保留。',
              okText: '清空',
              danger: true,
            })
            if (!ok) return
            await clearSubjects(classId)
            show('课程已清空', '🧹')
          }}
        >
          🗑️ 清空课程
        </Chip>
      </div>

      {doodleMode && (
        <div className={styles.penBar}>
          {PEN_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={styles.penColor}
              style={{
                background: c,
                boxShadow: penColor === c && !eraser ? `0 0 0 3px ${c}` : undefined,
                transform: penColor === c && !eraser ? 'scale(1.15)' : undefined,
              }}
              onClick={() => { setPenColor(c); setEraser(false) }}
            />
          ))}
          <span className={styles.divider} />
          {PEN_WIDTHS.map((w) => (
            <Chip key={w} active={penWidth === w && !eraser} onClick={() => { setPenWidth(w); setEraser(false) }}>
              {w === 2 ? '细' : w === 4 ? '中' : '粗'}
            </Chip>
          ))}
          <Chip active={eraser} onClick={() => setEraser((v) => !v)}>
            🧽 橡皮
          </Chip>
          <Chip onClick={() => { const next = strokes.slice(0, -1); commit(next) }}>↩︎ 撤销</Chip>
          <Button size="sm" onClick={() => { setDoodleMode(false); setEraser(false) }}>
            完成
          </Button>
        </div>
      )}

      <div className={styles.board}>
        <div className={styles.scroll} onScroll={hideTip}>
        <div
          className={styles.grid}
          style={{ gridTemplateColumns: `58px repeat(${days}, minmax(76px, 1fr))` }}
        >
          <div className={styles.corner} />
          {Array.from({ length: days }, (_, i) => (
            <div key={`h${i}`} className={styles.th}>
              周{WEEK[i]}
            </div>
          ))}

          {periods.map((p) => (
            <Fragment key={p.index}>
              <div className={styles.tp}>
                <b>{p.index}</b>
                <small>{p.startTime}</small>
              </div>
              {Array.from({ length: days }, (_, i) => {
                const day = i + 1
                const cell = cellMap.get(`${day}-${p.index}`)
                return (
                  <button
                    key={`${day}-${p.index}`}
                    type="button"
                    className={styles.cell}
                    style={
                      cell
                        ? { background: softOf(cell.color ?? 'blue'), color: 'var(--c-ink)' }
                        : undefined
                    }
                    onClick={() => !doodleMode && setEditing({ day, period: p.index })}
                    onMouseEnter={(e) => cell?.note && showTip(e, cell.note)}
                    onMouseLeave={hideTip}
                  >
                    {cell?.subject && (
                      <span
                        className={styles.subject}
                        style={{ borderBottom: `2px solid ${valueOf(cell.color ?? 'blue')}` }}
                      >
                        {cell.subject}
                      </span>
                    )}
                    {cell?.note && <span className={styles.note}>📌</span>}
                  </button>
                )
              })}
            </Fragment>
          ))}
        </div>
        </div>

        <DoodleLayer
          active={doodleMode}
          strokes={strokes}
          onChange={commit}
          color={penColor}
          width={penWidth}
          eraser={eraser}
        />
      </div>

      {tip && (
        <div
          className={`${styles.cellTip} ${tip.placement === 'top' ? styles.tipTop : styles.tipBottom}`}
          style={{ top: tip.top, left: tip.left }}
          role="tooltip"
        >
          <span className={styles.tipPin}>📌</span>
          {tip.text}
        </div>
      )}

      <p className={styles.tip}>
        {doodleMode ? '涂鸦模式：可直接用手指或鼠标书写，画完点「完成」' : '点击格子可填写科目与备注'}
      </p>

      {editing && classId && (
        <CellModal
          open
          onClose={() => setEditing(null)}
          classId={classId}
          day={editing.day}
          period={editing.period}
          periodName={periods[editing.period - 1]?.name ?? `第${editing.period}节`}
          cell={cellMap.get(`${editing.day}-${editing.period}`)}
        />
      )}
    </div>
  )
}
