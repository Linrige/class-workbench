import { useEffect, useState } from 'react'
import Button, { IconButton } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Field'
import Empty from '@/components/Empty'
import { useAttendanceBoard, useAttendanceSlots } from '@/hooks/useAttendance'
import { ATTEND_STATUS, valueOf } from '@/domain/constants'
import { askConfirm } from '@/components/ui/confirm'
import {
  clearSlot,
  cycleStatus,
  deleteRecord,
  markAllPresent,
} from '@/domain/repositories/attendance'
import { ensureDefaults } from '@/domain/repositories/attendanceSlots'
import { useToastStore } from '@/stores/toastStore'
import { addDays, formatHuman, today } from '@/utils/date'
import type { AttendStatus } from '@/domain/types'
import styles from './Attendance.module.css'

type StatusFilter = AttendStatus | 'all'

export default function Attendance() {
  const [date, setDate] = useState(today())
  const [slotId, setSlotId] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const slots = useAttendanceSlots()
  const board = useAttendanceBoard(date, slotId)
  const show = useToastStore((s) => s.show)

  useEffect(() => {
    void ensureDefaults()
  }, [])

  useEffect(() => {
    if (!slotId && slots[0]) setSlotId(slots[0].id)
  }, [slots, slotId])

  const slotName = slots.find((s) => s.id === slotId)?.name ?? ''

  if (slots.length === 0) {
    return (
      <Empty
        emoji="📋"
        text="还没有考勤时段"
        hint="去「设置 → 考勤时段」添加，例如早操、早读、课堂"
      />
    )
  }

  return (
    <div>
      <div className={styles.slotRow}>
        <span className={styles.hint}>时段：</span>
        {slots.map((s) => (
          <Chip key={s.id} active={s.id === slotId} onClick={() => setSlotId(s.id)}>
            {s.name}
          </Chip>
        ))}
      </div>

      <div className={styles.dateRow}>
        <Chip onClick={() => setDate(addDays(date, -1))}>← 前一天</Chip>
        <Chip onClick={() => setDate(today())}>今天</Chip>
        <Chip onClick={() => setDate(addDays(date, 1))}>后一天 →</Chip>
        <span className={styles.human}>{formatHuman(date)}</span>
        <input
          type="date"
          className={styles.dateInput}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className={styles.filterRow}>
        <span className={styles.hint}>只看：</span>
        {(['all', 0, 1, 2, 3] as StatusFilter[]).map((f) => (
          <Chip key={String(f)} active={filter === f} onClick={() => setFilter(f)}>
            {f === 'all'
              ? '全部'
              : `${ATTEND_STATUS[f as AttendStatus].emoji} ${ATTEND_STATUS[f as AttendStatus].label}`}
          </Chip>
        ))}
        <span className={styles.hint} style={{ marginLeft: 'auto' }}>
          未登记默认「到达」，点击切换状态
        </span>
      </div>

      {board.length === 0 ? (
        <Empty emoji="🏫" text="还没有班级" hint="先去「学生」模块创建班级，再来记录考勤" />
      ) : (
        <div className={styles.list}>
          {board.map(({ classEntity, items }) => {
            const count = (s: AttendStatus) => items.filter((i) => i.status === s).length
            const visible = filter === 'all' ? items : items.filter((i) => i.status === filter)
            return (
              <section key={classEntity.id} className={styles.card}>
                <header className={styles.cardHead}>
                  <span className={styles.dot} style={{ background: valueOf(classEntity.color) }} />
                  <div className={styles.cardTitle}>
                    {classEntity.name}
                    <span className={styles.cardCount}>{items.length} 人</span>
                  </div>
                  <div className={styles.cardOps}>
                    <IconButton
                      title="全部标记到达"
                      onClick={async () => {
                        await markAllPresent(date, slotId, classEntity.id)
                        show('已全部标记到达', '✅')
                      }}
                    >
                      ✅
                    </IconButton>
                  </div>
                </header>

                <div className={styles.counters}>
                  <span className={styles.cOk}>
                    {ATTEND_STATUS[0].emoji} {ATTEND_STATUS[0].label} {count(0)}
                  </span>
                  <span className={styles.cLate}>
                    {ATTEND_STATUS[1].emoji} {ATTEND_STATUS[1].label} {count(1)}
                  </span>
                  <span className={styles.cAbsent}>
                    {ATTEND_STATUS[2].emoji} {ATTEND_STATUS[2].label} {count(2)}
                  </span>
                  <span className={styles.cLeave}>
                    {ATTEND_STATUS[3].emoji} {ATTEND_STATUS[3].label} {count(3)}
                  </span>
                </div>

                {visible.length === 0 ? (
                  <p className={styles.groupEmpty}>该班级没有符合条件的学生</p>
                ) : (
                  <div className={styles.studentBtns}>
                    {visible.map(({ student, status, registered }) => (
                      <div key={student.id} className={styles.stuWrap}>
                        {registered && (
                          <button
                            type="button"
                            className={styles.stuDel}
                            title="删除该生考勤记录"
                            aria-label="删除该生考勤记录"
                            onClick={async () => {
                              await deleteRecord(date, slotId, student.id)
                              show(`已清除 ${student.name} 的考勤`, '🧹')
                            }}
                          >
                            ×
                          </button>
                        )}
                        <button
                          type="button"
                          className={styles.stuBtn}
                          style={{
                            background: ATTEND_STATUS[status].bg,
                            color: ATTEND_STATUS[status].fg,
                          }}
                          onClick={() => cycleStatus(date, slotId, student.id)}
                          title={`${student.name}：${ATTEND_STATUS[status].label}（点击切换）`}
                        >
                          <span className={styles.stuEmoji}>{ATTEND_STATUS[status].emoji}</span>
                          <span className={styles.stuName}>{student.name}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )
          })}

          <div className={styles.footerOps}>
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                const ok = await askConfirm({
                  title: '🧹 清空考勤',
                  content: `确定清空 ${date}「${slotName}」的考勤记录吗？所有人将恢复为默认「到达」。`,
                  okText: '清空',
                  danger: true,
                })
                if (!ok) return
                await clearSlot(date, slotId)
                show('考勤已清空', '🧹')
              }}
            >
              🧹 清空本时段考勤
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
