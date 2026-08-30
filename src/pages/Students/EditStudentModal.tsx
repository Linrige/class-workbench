import { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import { Chip, Field, Input } from '@/components/ui/Field'
import { updateStudent } from '@/domain/repositories/students'
import type { Student } from '@/domain/types'

interface Props {
  student: Student | null
  onClose: () => void
  onDone?: () => void
}

export default function EditStudentModal({ student, onClose, onDone }: Props) {
  const [name, setName] = useState('')
  const [no, setNo] = useState('')
  const [gender, setGender] = useState<Student['gender'] | ''>('')
  const [groupName, setGroupName] = useState('')

  useEffect(() => {
    if (!student) return
    setName(student.name)
    setNo(student.no ?? '')
    setGender(student.gender ?? '')
    setGroupName(student.groupName ?? '')
  }, [student])

  async function handleOk() {
    if (!student || !name.trim()) return
    await updateStudent(student.id, {
      name: name.trim(),
      no: no.trim() || undefined,
      gender: gender || undefined,
      groupName: groupName.trim() || undefined,
    })
    onDone?.()
    onClose()
  }

  return (
    <Modal open={Boolean(student)} title="🧒 学生信息" onClose={onClose} onOk={handleOk}>
      <Field label="姓名">
        <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </Field>

      <Field label="学号">
        <Input value={no} onChange={(e) => setNo(e.target.value)} placeholder="选填" />
      </Field>

      <Field label="性别">
        <div style={{ display: 'flex', gap: 8 }}>
          <Chip active={gender === 'male'} onClick={() => setGender('male')}>
            ♂ 男
          </Chip>
          <Chip active={gender === 'female'} onClick={() => setGender('female')}>
            ♀ 女
          </Chip>
          <Chip active={!gender} onClick={() => setGender('')}>
            未设置
          </Chip>
        </div>
      </Field>

      <Field label="小组 / 分组">
        <Input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="例如：第一组（选填）"
        />
      </Field>
    </Modal>
  )
}
