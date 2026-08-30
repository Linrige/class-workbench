import { useEffect, useState } from 'react'
import ProgressRing from '@/components/ui/ProgressRing'
import { IconButton } from '@/components/ui/Button'
import { SUBMIT_STATUS, valueOf } from '@/domain/constants'
import {
  cycleRecord,
  markAllDone,
  removeHomework,
  syncRecords,
  updateHomework,
} from '@/domain/repositories/homework'
import { calcProgress } from '@/domain/services/homeworkStats'
import { useToastStore } from '@/stores/toastStore'
import { askConfirm } from '@/components/ui/confirm'
import type { SubmitStatus } from '@/domain/types'
import type { HomeworkBoard } from '@/hooks/useHomework'
import EditHomeworkModal from './EditHomeworkModal'
import styles from './Homework.module.css'

interface Props {
  board: HomeworkBoard
  /** 状态筛选：undefined 显示全部 */
  filter?: SubmitStatus
}

export default function HomeworkCard({ board, filter }: Props) {
  const { homework, groups } = board
  const show = useToastStore((s) => s.show)
  const [editOpen, setEditOpen] = useState(false)

  const allItems = groups.flatMap((g) => g.items)
  const progress = calcProgress(allItems.map((i) => ({ status: i.status })))

  // 班级新增 / 移除学生后自动补齐或清理记录（幂等）
  useEffect(() => {
    void syncRecords(homework.id)
  }, [homework.id, allItems.length])

  async function handleDelete() {
    const ok = await askConfirm({
      title: '🗑️ 删除作业',
      content: `确定删除作业「${homework.title}」吗？所有提交记录都会一并删除。`,
      okText: '删除',
      danger: true,
    })
    if (!ok) return
    await removeHomework(homework.id)
    show('作业已删除', '🗑️')
  }

  return (
    <section className={styles.card}>
      <header className={styles.hwHead}>
        <ProgressRing value={progress.rate} />
        <div className={styles.hwInfo}>
          <div className={styles.hwTitle}>{homework.title}</div>
          <div className={styles.hwMeta}>
            {homework.subject && <span className={styles.subject}>{homework.subject}</span>}
            <span>
              {progress.done}/{progress.total} 已完成
            </span>
          </div>
        </div>
        <div className={styles.hwOps}>
          <IconButton title="全部标记完成" onClick={async () => {
            await markAllDone(homework.id)
            show('已全部标记完成', '✅')
          }}>
            ✅
          </IconButton>
          <IconButton title={homework.status === 'active' ? '归档' : '恢复'} onClick={async () => {
            await updateHomework(homework.id, {
              status: homework.status === 'active' ? 'archived' : 'active',
            })
            show(homework.status === 'active' ? '已归档' : '已恢复', '📦')
          }}>
            📦
          </IconButton>
          <IconButton title="编辑" onClick={() => setEditOpen(true)}>
            ✏️
          </IconButton>
          <IconButton title="删除" onClick={handleDelete}>
            🗑️
          </IconButton>
        </div>
      </header>

      {homework.note && <p className={styles.note}>📌 {homework.note}</p>}

      <div className={styles.counters}>
        <span className={styles.cDone}>
          {SUBMIT_STATUS[1].emoji} {SUBMIT_STATUS[1].label} {progress.done}
        </span>
        <span className={styles.cFix}>
          {SUBMIT_STATUS[2].emoji} {SUBMIT_STATUS[2].label} {progress.correction}
        </span>
        <span className={styles.cMiss}>
          {SUBMIT_STATUS[3].emoji} {SUBMIT_STATUS[3].label} {progress.missing}
        </span>
        <span className={styles.cPend}>
          {SUBMIT_STATUS[0].emoji} {SUBMIT_STATUS[0].label} {progress.pending}
        </span>
      </div>

      {groups.map((g) => {
        const items =
          filter === undefined ? g.items : g.items.filter((i) => i.status === filter)
        return (
          <div key={g.classEntity.id} className={styles.group}>
            <div className={styles.groupTitle}>
              <span className={styles.dot} style={{ background: valueOf(g.classEntity.color) }} />
              {g.classEntity.name}
              <span className={styles.groupCount}>{g.items.length} 人</span>
            </div>
            {items.length === 0 ? (
              <p className={styles.groupEmpty}>该班级没有符合条件的学生</p>
            ) : (
              <div className={styles.studentBtns}>
                {items.map(({ student, status }) => (
                  <button
                    key={student.id}
                    type="button"
                    className={styles.stuBtn}
                    style={{
                      background: SUBMIT_STATUS[status].bg,
                      color: SUBMIT_STATUS[status].fg,
                    }}
                    onClick={() => cycleRecord(homework.id, student.id)}
                    title={`${student.name}：${SUBMIT_STATUS[status].label}（点击切换）`}
                  >
                    <span className={styles.stuEmoji}>{SUBMIT_STATUS[status].emoji}</span>
                    <span className={styles.stuName}>{student.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <EditHomeworkModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        homework={homework}
        onDone={() => show('作业已更新', '✅')}
      />
    </section>
  )
}
