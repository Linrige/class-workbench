import { useMemo, useState } from 'react'
import Button, { IconButton } from '@/components/ui/Button'
import Empty from '@/components/Empty'
import StudentAvatar from '@/components/StudentAvatar'
import SearchInput from '@/components/ui/SearchInput'
import { useStudents } from '@/hooks/useStudents'
import { removeStudent } from '@/domain/repositories/students'
import { removeClass } from '@/domain/repositories/classes'
import { saveClassAsTemplate } from '@/domain/repositories/templates'
import { useToastStore } from '@/stores/toastStore'
import { askConfirm } from '@/components/ui/confirm'
import AssignHomeworkModal from '@/components/homework/AssignHomeworkModal'
import AddClassModal from './AddClassModal'
import AddStudentModal from './AddStudentModal'
import EditStudentModal from './EditStudentModal'
import type { ClassEntity, Student } from '@/domain/types'
import styles from './Students.module.css'

interface Props {
  classEntity: ClassEntity
  onBack: () => void
}

export default function ClassDetail({ classEntity, onBack }: Props) {
  const students = useStudents(classEntity.id)
  const [kw, setKw] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [hwOpen, setHwOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const show = useToastStore((s) => s.show)

  const filtered = useMemo(
    () => students.filter((s) => s.name.includes(kw.trim())),
    [students, kw],
  )

  async function handleDeleteStudent(id: string, name: string) {
    const ok = await askConfirm({
      title: '🗑️ 删除学生',
      content: `确定删除学生「${name}」吗？该学生的作业记录也会一并删除。`,
      okText: '删除',
      danger: true,
    })
    if (!ok) return
    await removeStudent(id)
    show(`已删除 ${name}`, '🗑️')
  }

  async function handleDeleteClass() {
    const ok = await askConfirm({
      title: '🗑️ 删除班级',
      content: `确定删除班级「${classEntity.name}」吗？班级内的学生、作业记录与课表都会一并删除。`,
      okText: '删除',
      danger: true,
    })
    if (!ok) return
    await removeClass(classEntity.id)
    show('班级已删除', '🗑️')
    onBack()
  }

  async function handleSaveTemplate() {
    await saveClassAsTemplate(classEntity.id, classEntity.name)
    show('已保存到首页班级管理', '📚')
  }

  return (
    <div>
      <div className={styles.detailHead}>
        <IconButton onClick={onBack}>←</IconButton>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className={styles.detailTitle}>{classEntity.name}</h2>
          <p className={styles.detailSub}>共 {students.length} 名学生</p>
        </div>
        <IconButton onClick={() => setEditOpen(true)} title="编辑班级">
          ✏️
        </IconButton>
        <IconButton onClick={handleSaveTemplate} title="存为模板">
          📚
        </IconButton>
        <IconButton onClick={handleDeleteClass} title="删除班级">
          🗑️
        </IconButton>
      </div>

      <div className={styles.toolbar}>
        <SearchInput
          className={styles.search}
          value={kw}
          onChange={setKw}
          placeholder="搜索学生姓名"
        />
        <Button onClick={() => setAddOpen(true)}>🧒 添加学生</Button>
        <Button variant="soft" onClick={() => setHwOpen(true)}>
          📝 布置作业
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Empty
          emoji={students.length === 0 ? '🧒' : '🔍'}
          text={students.length === 0 ? '还没有学生' : '没有匹配的学生'}
          hint={students.length === 0 ? '可以单个添加，也可以批量粘贴名单' : undefined}
        />
      ) : (
        <div className={styles.studentGrid}>
          {filtered.map((s) => (
            <div
              key={s.id}
              className={styles.student}
              role="button"
              tabIndex={0}
              title="点击查看 / 修改学生信息"
              onClick={() => setEditStudent(s)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setEditStudent(s)
                }
              }}
            >
              <button
                type="button"
                className={styles.del}
                onClick={(e) => {
                  e.stopPropagation()
                  void handleDeleteStudent(s.id, s.name)
                }}
                aria-label="删除"
              >
                ×
              </button>
              <StudentAvatar name={s.name} gender={s.gender} />
              <div className={styles.studentName}>{s.name}</div>
              {s.no && <div className={styles.studentNo}>{s.no}</div>}
            </div>
          ))}
        </div>
      )}

      <AddStudentModal open={addOpen} onClose={() => setAddOpen(false)} classId={classEntity.id} />
      <AssignHomeworkModal
        open={hwOpen}
        defaultClassId={classEntity.id}
        onClose={() => setHwOpen(false)}
        onDone={() => show('作业已布置，去作业模块查看', '📝')}
      />
      <AddClassModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editTarget={classEntity}
        onDone={() => show('班级已更新', '✅')}
      />
      <EditStudentModal
        student={editStudent}
        onClose={() => setEditStudent(null)}
        onDone={() => show('学生信息已更新', '✅')}
      />
    </div>
  )
}
