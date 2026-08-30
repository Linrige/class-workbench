import { useEffect, useState } from 'react'
import Card from '@/components/Card'
import { Chip } from '@/components/ui/Field'
import { useAttendanceRanking, type RankRange } from '@/hooks/useAttendanceRanking'
import { useClasses } from '@/hooks/useClasses'
import { valueOf } from '@/domain/constants'
import styles from './Home.module.css'

const RANGES: { key: RankRange; label: string }[] = [
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'all', label: '全部' },
]

const MEDALS = ['🥇', '🥈', '🥉']
const COLLAPSED = 3
const EXPANDED = 10

export default function RankingCard() {
  const classes = useClasses()
  const [range, setRange] = useState<RankRange>('week')
  const [classId, setClassId] = useState('')
  const [expanded, setExpanded] = useState(false)
  const { rows, total } = useAttendanceRanking(range, classId)
  const maxAbnormal = Math.max(1, ...rows.map((r) => r.abnormal))
  const visibleRows = rows.slice(0, expanded ? EXPANDED : COLLAPSED)
  const hasMore = rows.length > COLLAPSED

  useEffect(() => {
    if (!classId && classes[0]) setClassId(classes[0].id)
  }, [classes, classId])

  const current = classes.find((c) => c.id === classId)

  return (
    <Card
      title="考勤排行"
      emoji="📊"
      tone="orange"
      style={{ gridColumn: '1 / -1' }}
      extra={
        <div style={{ display: 'flex', gap: 6 }}>
          {RANGES.map((r) => (
            <Chip
              key={r.key}
              active={range === r.key}
              onClick={() => {
                setRange(r.key)
                setExpanded(false)
              }}
            >
              {r.label}
            </Chip>
          ))}
        </div>
      }
    >
      {classes.length === 0 ? (
        <div className={styles.tplEmpty}>
          <div style={{ fontSize: 30 }}>🏫</div>
          <p className={styles.tplEmptyText}>还没有班级</p>
          <p className={styles.tplEmptyHint}>先去「学生」模块创建班级</p>
        </div>
      ) : (
        <>
          <div className={styles.classPickRow}>
            <span className={styles.hintText}>班级：</span>
            {classes.map((c) => (
              <Chip
                key={c.id}
                active={c.id === classId}
                onClick={() => {
                  setClassId(c.id)
                  setExpanded(false)
                }}
              >
                <span
                  className={styles.rankDot}
                  style={{
                    background: valueOf(c.color),
                    opacity: c.id === classId ? 1 : 0.7,
                  }}
                />
                {c.name}
              </Chip>
            ))}
          </div>

          {rows.length === 0 ? (
            <p className={styles.rankEmpty}>这个班级还没有学生</p>
          ) : total === 0 ? (
            <div className={styles.tplEmpty}>
              <div style={{ fontSize: 30 }}>📊</div>
              <p className={styles.tplEmptyText}>这段时间没有考勤记录</p>
              <p className={styles.tplEmptyHint}>去「考勤」模块给「{current?.name}」打卡后即可查看排行</p>
            </div>
          ) : (
            <div className={styles.rankBlock}>
              {visibleRows.map((r, i) => {
                const clean = r.abnormal === 0
                return (
                  <div key={r.studentId} className={styles.rankRow}>
                    <span className={styles.rankNo}>{clean ? '✔️' : (MEDALS[i] ?? i + 1)}</span>
                    <span className={styles.rankName}>{r.name}</span>
                    <div className={styles.rankBarWrap}>
                      <div
                        className={`${styles.rankBar} ${clean ? styles.rankBarClean : ''}`}
                        style={{
                          width: clean ? '100%' : `${Math.round((r.abnormal / maxAbnormal) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className={styles.rankMeta}>
                      {clean ? (
                        <span className={styles.rankGood}>全勤</span>
                      ) : (
                        <>
                          ⏰ {r.late} · ❌ {r.absent}
                          {r.leave > 0 ? ` · 🏖️ ${r.leave}` : ''}
                        </>
                      )}
                    </span>
                  </div>
                )
              })}

              {hasMore && (
                <button
                  type="button"
                  className={styles.rankMore}
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded ? '收起 ▲' : `展开至前 ${Math.min(EXPANDED, rows.length)} 名 ▼`}
                </button>
              )}

              {expanded && rows.length > EXPANDED && (
                <p className={styles.rankEmpty}>
                  仅显示前 {EXPANDED} 名，该班共 {rows.length} 人
                </p>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  )
}
