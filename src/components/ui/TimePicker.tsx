import { useEffect, useRef, useState } from 'react'
import styles from './TimePicker.module.css'

interface Props {
  /** HH:mm 或空 */
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function scrollToValue(list: HTMLDivElement | null, v: number) {
  if (!list) return
  const el = list.querySelector<HTMLElement>(`[data-v="${v}"]`)
  if (el) list.scrollTop = el.offsetTop - list.clientHeight / 2 + el.clientHeight / 2
}

/**
 * 自定义时间选择器：小时 / 分钟两列固定高度滚动，
 * 替代原生 input[type=time]（原生下拉在 PC 上会从 0 点贯通到 23 点）。
 */
export default function TimePicker({ value, onChange, placeholder = '选择时间', className = '' }: Props) {
  const [open, setOpen] = useState(false)
  const [hour, setHour] = useState<number | null>(null)
  const [minute, setMinute] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const hourListRef = useRef<HTMLDivElement>(null)
  const minuteListRef = useRef<HTMLDivElement>(null)

  // 外部 value 变化时同步内部选中项
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map((s) => Number.parseInt(s, 10))
      setHour(Number.isNaN(h) ? null : h)
      setMinute(Number.isNaN(m) ? null : m)
    } else {
      setHour(null)
      setMinute(null)
    }
  }, [value])

  // 点击面板外部关闭
  useEffect(() => {
    if (!open) return
    function onDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  // 展开时滚动到当前选中值
  useEffect(() => {
    if (!open) return
    scrollToValue(hourListRef.current, hour ?? 8)
    scrollToValue(minuteListRef.current, minute ?? 0)
  }, [open, hour, minute])

  function commit(h: number | null, m: number | null) {
    const hh = h ?? 8
    const mm = m ?? 0
    onChange(`${pad(hh)}:${pad(mm)}`)
  }

  function pick(h: number | null, m: number | null) {
    setHour(h)
    setMinute(m)
    commit(h, m)
  }

  return (
    <div className={`${styles.root} ${className}`} ref={rootRef}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span>⏰</span>
        <span className={value ? styles.triggerValue : styles.triggerPlaceholder}>
          {value || placeholder}
        </span>
        {value && (
          <span
            className={styles.clear}
            role="button"
            tabIndex={-1}
            aria-label="清除时间"
            onClick={(e) => {
              e.stopPropagation()
              onChange('')
              setOpen(false)
            }}
          >
            ×
          </span>
        )}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.col}>
            <div className={styles.colTitle}>时</div>
            <div className={styles.colList} ref={hourListRef}>
              {HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  data-v={h}
                  className={`${styles.cell} ${hour === h ? styles.cellActive : ''}`}
                  onClick={() => pick(h, minute)}
                >
                  {pad(h)} 点
                </button>
              ))}
            </div>
          </div>
          <div className={styles.col}>
            <div className={styles.colTitle}>分</div>
            <div className={styles.colList} ref={minuteListRef}>
              {MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  data-v={m}
                  className={`${styles.cell} ${minute === m ? styles.cellActive : ''}`}
                  onClick={() => pick(hour, m)}
                >
                  {pad(m)} 分
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
