import { useState } from 'react'
import Button, { Fab } from '@/components/ui/Button'
import Empty from '@/components/Empty'
import { useClasses } from '@/hooks/useClasses'
import { useStudentCounts } from '@/hooks/useStudents'
import { valueOf } from '@/domain/constants'
import AssignHomeworkModal from '@/components/homework/AssignHomeworkModal'
import AddClassModal from './AddClassModal'
import ClassDetail from './ClassDetail'
import styles from './Students.module.css'

export default function Students() {
  const classes = useClasses()
  const counts = useStudentCounts()
  const [addOpen, setAddOpen] = useState(false)
  const [addTab, setAddTab] = useState<'manual' | 'import'>('manual')
  const [hwFor, setHwFor] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)

  const detail = classes.find((c) => c.id === detailId)
  if (detail) {
    return <ClassDetail classEntity={detail} onBack={() => setDetailId(null)} />
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <Button onClick={() => { setAddTab('manual'); setAddOpen(true) }}>🏫 新建班级</Button>
        <Button variant="soft" onClick={() => { setAddTab('import'); setAddOpen(true) }}>
          📥 导入班级模板
        </Button>
      </div>

      {classes.length === 0 ? (
        <Empty
          emoji="🏫"
          text="还没有班级"
          hint="可以手动创建，或把首页「班级管理」里保存好的模板一键导入"
        />
      ) : (
        <div className={styles.grid}>
          {classes.map((c) => (
            <div key={c.id} className={styles.classCard}>
              <div className={styles.colorBar} style={{ background: valueOf(c.color) }} />
              <div className={styles.classBody}>
                <div className={styles.classEmoji}>🏫</div>
                <div className={styles.className}>{c.name}</div>
                <div className={styles.classMeta}>
                  {c.grade ? `${c.grade} · ` : ''}
                  {counts[c.id] ?? 0} 人
                </div>
                <div className={styles.classActions}>
                  <Button size="sm" variant="soft" onClick={() => setDetailId(c.id)}>
                    管理学生
                  </Button>
                  <Button size="sm" onClick={() => setHwFor(c.id)}>
                    📝 布置作业
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddClassModal open={addOpen} onClose={() => setAddOpen(false)} defaultTab={addTab} />
      <AssignHomeworkModal
        open={hwFor !== null}
        defaultClassId={hwFor ?? undefined}
        onClose={() => setHwFor(null)}
        onDone={() => setHwFor(null)}
      />
      <Fab onClick={() => { setAddTab('manual'); setAddOpen(true) }} />
    </div>
  )
}
