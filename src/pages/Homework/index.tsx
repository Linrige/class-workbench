import { useState } from 'react'
import Button, { Fab } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Field'
import Empty from '@/components/Empty'
import { useHomeworkBoard } from '@/hooks/useHomework'
import { SUBMIT_STATUS } from '@/domain/constants'
import AssignHomeworkModal from '@/components/homework/AssignHomeworkModal'
import HomeworkCard from './HomeworkCard'
import type { HomeworkEntity, SubmitStatus } from '@/domain/types'
import styles from './Homework.module.css'

type StatusFilter = SubmitStatus | 'all'

export default function Homework() {
  const [status, setStatus] = useState<HomeworkEntity['status']>('active')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [addOpen, setAddOpen] = useState(false)
  const board = useHomeworkBoard(status)

  return (
    <div>
      <div className={styles.toolbar}>
        <Chip active={status === 'active'} onClick={() => setStatus('active')}>
          📝 进行中
        </Chip>
        <Chip active={status === 'archived'} onClick={() => setStatus('archived')}>
          📦 已归档
        </Chip>
        <span style={{ flex: 1 }} />
        <Button size="sm" onClick={() => setAddOpen(true)}>
          ＋ 布置作业
        </Button>
      </div>

      <div className={styles.filterRow}>
        <span className={styles.filterHint}>只看：</span>
        {(['all', 0, 1, 2, 3] as StatusFilter[]).map((f) => (
          <Chip key={String(f)} active={filter === f} onClick={() => setFilter(f)}>
            {f === 'all' ? '全部' : `${SUBMIT_STATUS[f as SubmitStatus].emoji} ${SUBMIT_STATUS[f as SubmitStatus].label}`}
          </Chip>
        ))}
        <span className={styles.filterHint} style={{ marginLeft: 'auto' }}>
          点击学生按钮切换状态
        </span>
      </div>

      {board.length === 0 ? (
        <Empty
          emoji={status === 'active' ? '📝' : '📦'}
          text={status === 'active' ? '还没有作业' : '暂无归档作业'}
          hint={status === 'active' ? '在「学生」模块或这里点击布置作业' : undefined}
        />
      ) : (
        <div className={styles.list}>
          {board.map((b) => (
            <HomeworkCard
              key={b.homework.id}
              board={b}
              filter={filter === 'all' ? undefined : (filter as SubmitStatus)}
            />
          ))}
        </div>
      )}

      <AssignHomeworkModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onDone={() => setAddOpen(false)}
      />
      <Fab onClick={() => setAddOpen(true)} />
    </div>
  )
}
